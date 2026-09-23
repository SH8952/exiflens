"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseExifFile, type ParsedExif } from "@/lib/exif";
import { removeMetadataFromFile, type ImageMetadataFormat } from "@/lib/metadata-remover";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPT_ATTR = "image/jpeg,image/png,image/webp";
const MAX_FILES = 20;

type FileStatus = "analyzing" | "ready" | "processing" | "done" | "unsupported" | "error";

type FileEntry = {
  id: string;
  file: File;
  status: FileStatus;
  summary: ParsedExif | null;
  resultBlob: Blob | null;
  resultUrl: string | null;
  errorMessage: string | null;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function ExifRemoverCard() {
  const t = useTranslations("ExifRemover");

  const [entries, setEntries] = React.useState<FileEntry[]>([]);
  const [gpsOnly, setGpsOnly] = React.useState(false);
  const [removeIptc, setRemoveIptc] = React.useState(true);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isZipping, setIsZipping] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFilesAdded = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList).slice(0, Math.max(0, MAX_FILES - entries.length));

    const newEntries: FileEntry[] = files.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      file,
      status: ACCEPTED_TYPES.includes(file.type) ? "analyzing" : "unsupported",
      summary: null,
      resultBlob: null,
      resultUrl: null,
      errorMessage: null,
    }));

    setEntries((prev) => [...prev, ...newEntries]);

    for (const entry of newEntries) {
      if (entry.status !== "analyzing") continue;
      parseExifFile(entry.file)
        .then((summary) => {
          setEntries((prev) =>
            prev.map((e) => (e.id === entry.id ? { ...e, summary, status: "ready" } : e)),
          );
        })
        .catch(() => {
          setEntries((prev) =>
            prev.map((e) => (e.id === entry.id ? { ...e, status: "ready", summary: null } : e)),
          );
        });
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeEntry = (id: string) => {
    setEntries((prev) => {
      const target = prev.find((e) => e.id === id);
      if (target?.resultUrl) URL.revokeObjectURL(target.resultUrl);
      return prev.filter((e) => e.id !== id);
    });
  };

  const processAll = async () => {
    setIsProcessing(true);
    const targets = entries.filter((e) => e.status === "ready" || e.status === "error");
    for (const target of targets) {
      setEntries((prev) => prev.map((e) => (e.id === target.id ? { ...e, status: "processing" } : e)));
      try {
        const result = await removeMetadataFromFile(target.file, { gpsOnly, removeIptc });
        if (!result) {
          setEntries((prev) =>
            prev.map((e) => (e.id === target.id ? { ...e, status: "unsupported" } : e)),
          );
          continue;
        }
        const url = URL.createObjectURL(result.blob);
        setEntries((prev) =>
          prev.map((e) =>
            e.id === target.id
              ? { ...e, status: "done", resultBlob: result.blob, resultUrl: url, errorMessage: null }
              : e,
          ),
        );
      } catch (err) {
        setEntries((prev) =>
          prev.map((e) =>
            e.id === target.id
              ? { ...e, status: "error", errorMessage: err instanceof Error ? err.message : String(err) }
              : e,
          ),
        );
      }
    }
    setIsProcessing(false);
  };

  const downloadAllAsZip = async () => {
    const doneEntries = entries.filter((e) => e.status === "done" && e.resultBlob);
    if (doneEntries.length === 0) return;
    setIsZipping(true);
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      for (const entry of doneEntries) {
        zip.file(entry.file.name, entry.resultBlob as Blob);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "exiflens-cleaned-photos.zip";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsZipping(false);
    }
  };

  const readyCount = entries.filter((e) => e.status === "ready").length;
  const doneCount = entries.filter((e) => e.status === "done").length;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t("cardTitle")}
      </h2>
      <p className="mb-4 text-xs text-muted-foreground">{t("privacyNote")}</p>

      <div className="flex flex-col gap-3 text-sm">
        <label className="flex flex-col gap-1.5">
          <span className="text-muted-foreground">{t("uploadLabel")}</span>
          <Input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_ATTR}
            multiple
            onChange={(e) => handleFilesAdded(e.target.files)}
          />
        </label>
        <p className="text-xs text-muted-foreground">{t("formatNote")}</p>

        {entries.length > 0 ? (
          <div className="flex flex-col gap-2">
            {entries.map((entry) => (
              <FileRow key={entry.id} entry={entry} onRemove={() => removeEntry(entry.id)} t={t} />
            ))}
          </div>
        ) : null}

        <div className="mt-1 flex flex-col gap-3 rounded-lg border border-border px-3 py-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("advancedTitle")}
          </h3>

          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={gpsOnly}
              onChange={(e) => setGpsOnly(e.target.checked)}
            />
            <span>
              <span className="block">{t("gpsOnlyLabel")}</span>
              <span className="block text-xs text-muted-foreground">{t("gpsOnlyHint")}</span>
            </span>
          </label>

          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={removeIptc}
              onChange={(e) => setRemoveIptc(e.target.checked)}
            />
            <span>
              <span className="block">{t("removeIptcLabel")}</span>
              <span className="block text-xs text-muted-foreground">{t("removeIptcHint")}</span>
            </span>
          </label>
        </div>

        <div className="mt-1 flex flex-wrap gap-2">
          <Button onClick={processAll} disabled={readyCount === 0 || isProcessing}>
            {isProcessing ? t("processingButton") : t("processButton", { count: readyCount })}
          </Button>
          {doneCount > 1 ? (
            <Button variant="secondary" onClick={downloadAllAsZip} disabled={isZipping}>
              {isZipping ? t("zippingButton") : t("downloadZipButton", { count: doneCount })}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function FileRow({
  entry,
  onRemove,
  t,
}: {
  entry: FileEntry;
  onRemove: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border px-3 py-2 text-xs sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">{entry.file.name}</p>
        <p className="text-muted-foreground">
          {formatFileSize(entry.file.size)}
          {entry.summary ? (
            <>
              {" · "}
              {entry.summary.camera ? entry.summary.camera : t("noCameraInfo")}
              {" · "}
              {entry.summary.gps ? t("gpsPresent") : t("gpsAbsent")}
              {entry.summary.takenAt ? ` · ${entry.summary.takenAt}` : ""}
            </>
          ) : null}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <StatusBadge status={entry.status} t={t} />
        {entry.status === "done" && entry.resultUrl ? (
          <a
            href={entry.resultUrl}
            download={entry.file.name}
            className="text-primary underline underline-offset-2"
          >
            {t("downloadOne")}
          </a>
        ) : null}
        {entry.status === "error" && entry.errorMessage ? (
          <span className="text-destructive">{entry.errorMessage}</span>
        ) : null}
        <button
          type="button"
          onClick={onRemove}
          className="text-muted-foreground hover:text-foreground"
          aria-label={t("removeFile")}
        >
          ×
        </button>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
  t,
}: {
  status: FileStatus;
  t: ReturnType<typeof useTranslations>;
}) {
  const label =
    status === "analyzing"
      ? t("statusAnalyzing")
      : status === "ready"
        ? t("statusReady")
        : status === "processing"
          ? t("statusProcessing")
          : status === "done"
            ? t("statusDone")
            : status === "unsupported"
              ? t("statusUnsupported")
              : t("statusError");

  const colorClass =
    status === "done"
      ? "text-primary"
      : status === "error" || status === "unsupported"
        ? "text-destructive"
        : "text-muted-foreground";

  return <span className={colorClass}>{label}</span>;
}

export type { ImageMetadataFormat };
