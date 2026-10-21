"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { formatBytes, savedPercent, ImageToolError } from "@/lib/image-ops";
import { useExifStore } from "@/store/exif-store";

export type ProcessResult = {
  blob: Blob;
  fileName: string;
  width: number;
  height: number;
};

type EntryStatus = "ready" | "processing" | "done" | "error";

type Entry = {
  id: string;
  file: File;
  thumbUrl: string;
  /** 원본이 커서 작은 썸네일을 따로 만드는 항목(만들어지기 전에는 thumbUrl이 빈 문자열). */
  smallThumb: boolean;
  status: EntryStatus;
  result: (ProcessResult & { url: string }) | null;
  errorKey: string | null;
};

/** 이 크기 이상의 원본은 목록 썸네일로 원본을 그대로 쓰지 않는다. 큰 사진을 여러 장 올려도 화면이 느려지지 않게 작은 이미지를 따로 만든다. */
const SMALL_THUMB_MIN_BYTES = 3 * 1024 * 1024;
const SMALL_THUMB_PX = 192;
/** 한 번에 올려 둘 수 있는 파일 합계 한도(브라우저 메모리 보호). */
const DEFAULT_MAX_TOTAL_BYTES = 1024 * 1024 * 1024;

/** 큰 원본을 작게 줄인 썸네일 주소를 만든다. 지원하지 않거나 실패하면 null(자리 표시만 보임). */
async function makeSmallThumbUrl(file: File): Promise<string | null> {
  try {
    if (typeof createImageBitmap !== "function") return null;
    const bitmap = await createImageBitmap(file, { resizeWidth: SMALL_THUMB_PX, resizeQuality: "low" });
    try {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, bitmap.width);
      canvas.height = Math.max(1, bitmap.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bitmap, 0, 0);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.7));
      return blob ? URL.createObjectURL(blob) : null;
    } finally {
      bitmap.close();
    }
  } catch {
    return null;
  }
}

const DEFAULT_ACCEPT = "image/jpeg,image/png,image/webp";
const DEFAULT_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
const ERROR_KEYS = [
  "decode-failed",
  "too-large",
  "encode-failed",
  "format-unsupported",
  "canvas-unavailable",
];

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : "";
}

export function BatchWorkbench({
  options,
  process,
  zipName,
  accept = DEFAULT_ACCEPT,
  extensions = DEFAULT_EXTENSIONS,
  maxFiles = 20,
  maxFileBytes = 200 * 1024 * 1024,
  maxTotalBytes = DEFAULT_MAX_TOTAL_BYTES,
  preview,
  showSizeChange = true,
  makeThumb,
  acceptHandoff = false,
}: {
  /** 홈에서 "용량 줄이기"로 넘어온 사진을 열릴 때 한 번 자동 추가할지(이미지 압축기만 true). */
  acceptHandoff?: boolean;
  /** 도구별 옵션 UI (상태는 도구 컴포넌트가 가진다). */
  options: React.ReactNode;
  /** 파일 하나를 처리해 결과를 돌려준다. 최신 옵션을 담은 클로저여야 한다. */
  process: (file: File) => Promise<ProcessResult>;
  zipName: string;
  accept?: string;
  extensions?: string[];
  maxFiles?: number;
  maxFileBytes?: number;
  /** 목록에 올려 둔 파일 전체의 합계 한도 */
  maxTotalBytes?: number;
  /** 첫 번째 파일 등으로 그리는 미리보기 슬롯 */
  preview?: (files: File[]) => React.ReactNode;
  showSizeChange?: boolean;
  /** 원본을 브라우저가 직접 못 그리는 형식(HEIC 등)일 때 썸네일을 대체 */
  makeThumb?: (file: File) => string | null;
}) {
  const t = useTranslations("ImageTools");
  const [entries, setEntries] = React.useState<Entry[]>([]);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [zipping, setZipping] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const entriesRef = React.useRef<Entry[]>([]);
  const aliveRef = React.useRef(true);
  const thumbChainRef = React.useRef<Promise<void>>(Promise.resolve());
  React.useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  React.useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      for (const e of entriesRef.current) {
        if (e.thumbUrl) URL.revokeObjectURL(e.thumbUrl);
        if (e.result) URL.revokeObjectURL(e.result.url);
      }
    };
  }, []);

  const isAcceptable = (file: File) =>
    extensions.includes(extensionOf(file.name)) ||
    accept.split(",").includes(file.type);

  // 큰 원본의 작은 썸네일을 한 장씩 차례로 만든다(동시에 여러 장을 풀어 메모리가 치솟는 것을 막음).
  const queueSmallThumb = (id: string, file: File) => {
    thumbChainRef.current = thumbChainRef.current.then(async () => {
      const url = await makeSmallThumbUrl(file);
      if (url) {
        if (!aliveRef.current) {
          URL.revokeObjectURL(url);
        } else {
          setEntries((prev) => {
            if (!prev.some((e) => e.id === id)) {
              URL.revokeObjectURL(url);
              return prev;
            }
            return prev.map((e) => (e.id === id ? { ...e, thumbUrl: url } : e));
          });
        }
      }
      await new Promise((r) => setTimeout(r, 0));
    });
  };

  const addFiles = (list: FileList | File[] | null) => {
    if (!list || list.length === 0) return;
    const incoming = Array.from(list);
    const notes: string[] = [];
    const room = Math.max(0, maxFiles - entries.length);
    const accepted: File[] = [];
    let skippedType = 0;
    let skippedSize = 0;
    let skippedTotal = 0;
    let totalBytes = entries.reduce((sum, e) => sum + e.file.size, 0);
    for (const f of incoming) {
      if (!isAcceptable(f)) {
        skippedType++;
        continue;
      }
      if (f.size > maxFileBytes) {
        skippedSize++;
        continue;
      }
      if (totalBytes + f.size > maxTotalBytes) {
        skippedTotal++;
        continue;
      }
      totalBytes += f.size;
      accepted.push(f);
    }
    const take = accepted.slice(0, room);
    if (accepted.length > room) notes.push(t("tooMany", { max: maxFiles }));
    if (skippedType > 0) notes.push(t("skippedType", { count: skippedType }));
    if (skippedSize > 0)
      notes.push(t("skippedSize", { count: skippedSize, max: Math.round(maxFileBytes / 1024 / 1024) }));
    if (skippedTotal > 0)
      notes.push(t("skippedTotal", { count: skippedTotal, max: Math.round(maxTotalBytes / 1024 / 1024) }));
    setNotice(notes.length > 0 ? notes.join(" ") : null);

    const next: Entry[] = take.map((file) => {
      const custom = makeThumb?.(file) ?? null;
      const small = custom === null && file.size >= SMALL_THUMB_MIN_BYTES;
      return {
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        file,
        thumbUrl: custom ?? (small ? "" : URL.createObjectURL(file)),
        smallThumb: small,
        status: "ready",
        result: null,
        errorKey: null,
      };
    });
    if (next.length > 0) setEntries((prev) => [...prev, ...next]);
    for (const e of next) if (e.smallThumb) queueSmallThumb(e.id, e.file);
    if (inputRef.current) inputRef.current.value = "";
  };

  // 홈에서 넘어온 사진 한 장을 한 번만 꺼내 목록에 추가(2026-10-08). 직접 들어온 경우엔 비어 있어 아무 일도 없다.
  React.useEffect(() => {
    if (!acceptHandoff) return;
    const file = useExifStore.getState().takeHandoffFile();
    // 효과 본문에서 상태를 바로 바꾸지 않도록 다음 작업으로 미룬다(파일은 이미 꺼냈으므로 중복되지 않는다).
    if (file) queueMicrotask(() => addFiles([file]));
    // 열릴 때 한 번만 실행
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeEntry = (id: string) => {
    setEntries((prev) => {
      const target = prev.find((e) => e.id === id);
      if (target?.thumbUrl) URL.revokeObjectURL(target.thumbUrl);
      if (target?.result) URL.revokeObjectURL(target.result.url);
      return prev.filter((e) => e.id !== id);
    });
  };

  const clearAll = () => {
    for (const e of entries) {
      if (e.thumbUrl) URL.revokeObjectURL(e.thumbUrl);
      if (e.result) URL.revokeObjectURL(e.result.url);
    }
    setEntries([]);
    setNotice(null);
  };

  const processAll = async () => {
    setBusy(true);
    const targets = entriesRef.current.map((e) => e.id);
    for (const id of targets) {
      const target = entriesRef.current.find((e) => e.id === id);
      if (!target) continue;
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: "processing", errorKey: null } : e)),
      );
      try {
        const result = await process(target.file);
        const url = URL.createObjectURL(result.blob);
        setEntries((prev) =>
          prev.map((e) => {
            if (e.id !== id) return e;
            if (e.result) URL.revokeObjectURL(e.result.url);
            return { ...e, status: "done", result: { ...result, url } };
          }),
        );
      } catch (err) {
        const code = err instanceof ImageToolError ? err.message : "unknown";
        setEntries((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status: "error", errorKey: code } : e)),
        );
      }
      // 브라우저가 화면을 갱신할 틈을 준다 (큰 이미지를 연속 처리할 때 멈춘 듯 보이지 않게)
      await new Promise((r) => setTimeout(r, 0));
    }
    setBusy(false);
  };

  const downloadZip = async () => {
    const done = entries.filter((e) => e.status === "done" && e.result);
    if (done.length === 0) return;
    setZipping(true);
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      const used = new Set<string>();
      for (const e of done) {
        let name = e.result!.fileName;
        let n = 2;
        while (used.has(name)) {
          const dot = name.lastIndexOf(".");
          name = `${e.result!.fileName.slice(0, dot)}-${n++}${e.result!.fileName.slice(dot)}`;
        }
        used.add(name);
        zip.file(name, e.result!.blob);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = zipName;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } finally {
      setZipping(false);
    }
  };

  const doneCount = entries.filter((e) => e.status === "done").length;
  const totalBefore = entries
    .filter((e) => e.status === "done")
    .reduce((s, e) => s + e.file.size, 0);
  const totalAfter = entries
    .filter((e) => e.status === "done")
    .reduce((s, e) => s + (e.result?.blob.size ?? 0), 0);

  return (
    <div data-clarity-mask="True" className="rounded-xl border border-border bg-card p-5">
      <p className="mb-4 text-xs text-muted-foreground">{t("privacyNote")}</p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center text-sm transition-colors ${
          dragging ? "border-primary bg-primary/5" : "border-border"
        }`}
      >
        <p className="font-medium">{t("dropLabel")}</p>
        <p className="text-xs text-muted-foreground">{t("dropHint", { max: maxFiles })}</p>
        <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
          {t("selectButton")}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {notice ? <p className="mt-2 text-xs text-destructive">{notice}</p> : null}

      {preview && entries.length > 0 ? (
        <div className="mt-4">{preview(entries.map((e) => e.file))}</div>
      ) : null}

      {entries.length > 0 ? (
        <div className="mt-4 flex flex-col gap-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-col gap-2 rounded-lg border border-border px-3 py-2 text-xs sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                {entry.smallThumb && !entry.thumbUrl ? (
                  <div className="size-12 shrink-0 rounded bg-muted" aria-hidden />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={entry.smallThumb ? entry.thumbUrl : (entry.result?.url ?? entry.thumbUrl)}
                    alt=""
                    className="size-12 shrink-0 rounded object-cover"
                  />
                )}
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{entry.file.name}</p>
                  <p className="text-muted-foreground">
                    {formatBytes(entry.file.size)}
                    {entry.status === "done" && entry.result ? (
                      <>
                        {" → "}
                        <span className="font-medium text-foreground">
                          {formatBytes(entry.result.blob.size)}
                        </span>
                        {showSizeChange ? (
                          <>
                            {" ("}
                            {(() => {
                              const p = savedPercent(entry.file.size, entry.result.blob.size);
                              return p >= 0 ? `-${p}%` : `+${Math.abs(p)}%`;
                            })()}
                            {")"}
                          </>
                        ) : null}
                        {` · ${entry.result.width}×${entry.result.height}px`}
                      </>
                    ) : null}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span
                  className={
                    entry.status === "done"
                      ? "text-primary"
                      : entry.status === "error"
                        ? "text-destructive"
                        : "text-muted-foreground"
                  }
                >
                  {entry.status === "error"
                    ? t(`errors.${ERROR_KEYS.includes(entry.errorKey ?? "") ? entry.errorKey : "unknown"}`)
                    : t(
                        entry.status === "ready"
                          ? "statusReady"
                          : entry.status === "processing"
                            ? "statusProcessing"
                            : "statusDone",
                      )}
                </span>
                {entry.status === "done" && entry.result ? (
                  <a
                    href={entry.result.url}
                    download={entry.result.fileName}
                    className="text-primary underline underline-offset-2"
                  >
                    {t("downloadOne")}
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={() => removeEntry(entry.id)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={t("removeFile")}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-3 rounded-lg border border-border px-3 py-3 text-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("optionsTitle")}
        </h3>
        {options}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button onClick={processAll} disabled={entries.length === 0 || busy}>
          {busy ? t("processingButton") : t("processButton", { count: entries.length })}
        </Button>
        {doneCount > 1 ? (
          <Button variant="secondary" onClick={downloadZip} disabled={zipping}>
            {zipping ? t("zippingButton") : t("downloadZipButton", { count: doneCount })}
          </Button>
        ) : null}
        {entries.length > 0 ? (
          <Button variant="ghost" onClick={clearAll} disabled={busy}>
            {t("clearAll")}
          </Button>
        ) : null}
        {showSizeChange && doneCount > 0 ? (
          <span className="text-xs text-muted-foreground">
            {t("totalSummary", {
              before: formatBytes(totalBefore),
              after: formatBytes(totalAfter),
            })}
          </span>
        ) : null}
      </div>
    </div>
  );
}
