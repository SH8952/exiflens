"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useExifStore } from "@/store/exif-store";
import { GpsMapModal } from "@/components/gps-map-modal";
import { Link } from "@/i18n/navigation";
import { formatBytes } from "@/lib/image-ops";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  categorizeMetadata,
  downloadMetadata,
  isFullMetadataSupported,
  readFullMetadata,
  type FullMetadataGroup,
  type MetadataCategoryKey,
  type MetadataExportFormat,
} from "@/lib/exif-full";

/** 이 용량 이상이면 "용량 줄이기" 바로가기를 보여 준다 — 주요 SNS 사진 업로드 한도 중 가장 낮은 X(5MB) 기준(2026-10-08). */
const COMPRESS_LINK_MIN_BYTES = 5 * 1024 * 1024;
/** 이미지 압축기가 받는 파일 한 장의 최대 용량(batch-workbench 기본값과 같다). */
const COMPRESSOR_MAX_BYTES = 60 * 1024 * 1024;
const COMPRESSOR_ACCEPT_RE = /\.(jpe?g|png|webp)$/i;

function isCompressorSupported(file: File): boolean {
  return (
    ["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    COMPRESSOR_ACCEPT_RE.test(file.name)
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value ?? "—"}</dd>
    </>
  );
}

function GpsRow({
  label,
  gps,
  viewMapLabel,
  onViewMap,
  warnLabel,
  onWarn,
}: {
  label: string;
  gps: { latitude: number; longitude: number } | null;
  viewMapLabel: string;
  onViewMap: () => void;
  /** GPS 안내 팝업을 다시 여는 경고 아이콘의 설명 — GPS가 있을 때만 아이콘을 보여 준다(2026-10-19). */
  warnLabel: string;
  onWarn: () => void;
}) {
  return (
    <>
      <dt className="flex items-center gap-1.5 text-muted-foreground">
        {label}
        {gps ? (
          <button
            type="button"
            onClick={onWarn}
            aria-label={warnLabel}
            title={warnLabel}
            className="text-destructive hover:opacity-80"
          >
            ⚠
          </button>
        ) : null}
      </dt>
      <dd className="flex items-center justify-end gap-2 text-right font-medium">
        {gps ? (
          <>
            <span>{`${gps.latitude.toFixed(6)}, ${gps.longitude.toFixed(6)}`}</span>
            <button
              type="button"
              onClick={onViewMap}
              className="shrink-0 text-primary underline underline-offset-2 hover:text-primary/80"
            >
              {viewMapLabel}
            </button>
          </>
        ) : (
          "—"
        )}
      </dd>
    </>
  );
}

type FullState = { file: File; status: "ready" | "error"; groups: FullMetadataGroup[] };

const CATEGORY_LABEL_KEYS = {
  image: "exifCatImage",
  shooting: "exifCatShooting",
  camera: "exifCatCamera",
  location: "exifCatLocation",
  editing: "exifCatEditing",
  copyright: "exifCatCopyright",
  xmp: "exifCatXmp",
  color: "exifCatColor",
  other: "exifCatOther",
} as const;

function TabButton({
  id,
  active,
  onClick,
  className,
  children,
}: {
  id: string;
  active: boolean;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      id={`exif-tab-${id}`}
      aria-selected={active}
      aria-controls={id === "summary" ? "exif-tabpanel-summary" : "exif-tabpanel-category"}
      onClick={onClick}
      className={cn(
        "shrink-0 whitespace-nowrap border-b-2 pb-2 text-sm font-semibold tracking-wide transition-colors",
        active
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** 탭 줄 오른쪽 끝의 "내보내기" 드롭다운 — 버튼을 따로 늘어놓지 않아 카드 높이가 변하지 않는다. */
function ExportMenu({
  label,
  items,
  onSelect,
}: {
  label: string;
  items: [MetadataExportFormat, string][];
  onSelect: (format: MetadataExportFormat) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative mb-1.5 shrink-0">
      <Button
        type="button"
        size="sm"
        variant="secondary"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="h-7 px-2.5"
      >
        {label}
        <span aria-hidden="true" className="text-xs">
          ▾
        </span>
      </Button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 min-w-36 rounded-md border border-border bg-card p-1 shadow-md"
        >
          {items.map(([format, text]) => (
            <button
              key={format}
              type="button"
              role="menuitem"
              onClick={() => {
                onSelect(format);
                setOpen(false);
              }}
              className="block w-full rounded px-3 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
            >
              {text}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ExifPanel({
  showCompressLink = false,
  showRemoverLink = false,
}: {
  showCompressLink?: boolean;
  showRemoverLink?: boolean;
}) {
  const t = useTranslations("Home");
  const status = useExifStore((s) => s.status);
  const data = useExifStore((s) => s.data);
  const file = useExifStore((s) => s.file);
  const setHandoffFile = useExifStore((s) => s.setHandoffFile);
  // 추출된 EXIF 목록에 GPS 위치 항목 추가, "지도보기" 클릭 시 구글 지도 모달로
  // 표시 (석한 요청, 2026-08-31). GPS 정보가 없는 사진은 다른 항목과 동일하게
  // "—"로 표시된다.
  const [showMap, setShowMap] = React.useState(false);
  // 탭 줄(2026-10-19): 맨 왼쪽 "추출된 EXIF"(요약) + 주제별 전체 메타데이터 탭들 + 맨 오른쪽 "내보내기" 드롭다운.
  // 전체 메타데이터는 사진이 올라오면 한 번 읽는다(공유 EXIF 저장소는 건드리지 않는다). 사진이 바뀌면 다시 읽는다.
  const [tab, setTab] = React.useState<"summary" | MetadataCategoryKey>("summary");
  const [full, setFull] = React.useState<FullState | null>(null);
  // GPS 안내 팝업(2026-10-19): 카드 높이를 늘리지 않도록 카드 위에 겹쳐 띄운다. GPS가 있는 사진을 올리면
  // 사진마다 한 번 자동으로 열리고, 닫으면 같은 사진으로는 다시 열리지 않는다(GPS 라벨 옆 ⚠ 로 다시 열 수 있다).
  const [gpsNoticeClosedFor, setGpsNoticeClosedFor] = React.useState<File | null>(null);

  const hasData = status === "success" && data !== null;
  const gps = hasData ? data.gps : null;
  // 파일 용량 — 촬영 날짜·시간 바로 아래(석한 요청, 2026-10-08). 5MB 이상이고 압축기가 받는
  // 형식(JPG·PNG·WebP, 60MB 이하)이면 "용량 줄이기" 바로가기를 보여 주고, 누르면 사진을 압축기로 넘긴다.
  const fileSizeLabel = hasData && file ? formatBytes(file.size) : null;
  const canCompress =
    showCompressLink &&
    hasData &&
    file !== null &&
    file.size >= COMPRESS_LINK_MIN_BYTES &&
    file.size <= COMPRESSOR_MAX_BYTES &&
    isCompressorSupported(file);

  React.useEffect(() => {
    if (!hasData || !file || !isFullMetadataSupported(file) || full?.file === file) return;
    let cancelled = false;
    readFullMetadata(file)
      .then((groups) => {
        if (!cancelled) setFull({ file, status: "ready", groups });
      })
      .catch(() => {
        if (!cancelled) setFull({ file, status: "error", groups: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [hasData, file, full]);
  const fullForFile = file && full && full.file === file ? full : null;
  const categories = React.useMemo(
    () => (fullForFile?.status === "ready" ? categorizeMetadata(fullForFile.groups) : []),
    [fullForFile],
  );
  // 탭 줄이 한 줄에 다 안 들어가면 가로로 스크롤된다 — 숨은 탭이 있다는 표시(양끝 그라데이션)와, 선택한 탭이 항상 보이도록 하는 자동 스크롤.
  const tabScrollRef = React.useRef<HTMLDivElement>(null);
  const [tabFade, setTabFade] = React.useState({ left: false, right: false });
  const scrollTabs = (direction: -1 | 1) => {
    const el = tabScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.max(120, Math.round(el.clientWidth * 0.6)), behavior: "smooth" });
  };
  // 사진이 바뀌어 현재 탭이 사라지면 요약 탭으로 돌아간다.
  const activeKey = categories.some((c) => c.key === tab) ? tab : "summary";
  const activeCategory = categories.find((c) => c.key === activeKey) ?? null;
  const canExport = fullForFile?.status === "ready" && fullForFile.groups.length > 0;
  const showGpsNotice = activeKey === "summary" && gps !== null && file !== null && gpsNoticeClosedFor !== file;

  React.useEffect(() => {
    const el = tabScrollRef.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setTabFade({ left: el.scrollLeft > 1, right: el.scrollLeft < max - 1 });
    };
    el.addEventListener("scroll", update, { passive: true });
    // 마우스 휠(세로 휠)로도 탭을 좌우로 넘긴다. 더 갈 곳이 없으면 페이지 스크롤에 맡긴다.
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      const next = el.scrollLeft + e.deltaY;
      if ((e.deltaY < 0 && el.scrollLeft <= 0) || (e.deltaY > 0 && el.scrollLeft >= max - 1)) return;
      e.preventDefault();
      el.scrollLeft = Math.min(max, Math.max(0, next));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    if (observer) {
      observer.observe(el);
      Array.from(el.children).forEach((child) => observer.observe(child));
    }
    return () => {
      el.removeEventListener("scroll", update);
      el.removeEventListener("wheel", onWheel);
      observer?.disconnect();
    };
  }, [categories]);

  React.useEffect(() => {
    const container = tabScrollRef.current;
    const tab = document.getElementById(`exif-tab-${activeKey}`);
    if (!container || !tab || !container.contains(tab)) return;
    const left = tab.offsetLeft - container.offsetLeft;
    const right = left + tab.offsetWidth;
    if (left < container.scrollLeft) container.scrollTo({ left: Math.max(0, left - 24) });
    else if (right > container.scrollLeft + container.clientWidth) {
      container.scrollTo({ left: right - container.clientWidth + 24 });
    }
  }, [activeKey, categories]);

  React.useEffect(() => {
    if (!showGpsNotice) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setGpsNoticeClosedFor(file);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showGpsNotice, file]);

  return (
    <div data-clarity-mask="True" className="relative rounded-xl border border-border bg-card p-5">
      <h2 className="sr-only">{t("exifSectionTitle")}</h2>
      <div
        role="tablist"
        aria-label={t("exifSectionTitle")}
        className="mb-4 flex items-end gap-5 border-b border-border"
      >
        <TabButton
          id="summary"
          active={activeKey === "summary"}
          onClick={() => setTab("summary")}
          className="-mb-px"
        >
          {t("exifSectionTitle")}
        </TabButton>
        <div className="relative -mb-px min-w-0 flex-1">
          <div
            ref={tabScrollRef}
            className="relative flex gap-5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {categories.map((c) => (
              <TabButton
                key={c.key}
                id={c.key}
                active={activeKey === c.key}
                onClick={() => setTab(c.key)}
              >
                {t(CATEGORY_LABEL_KEYS[c.key])}
              </TabButton>
            ))}
          </div>
          {tabFade.left ? (
            <button
              type="button"
              aria-hidden="true"
              tabIndex={-1}
              onClick={() => scrollTabs(-1)}
              className="absolute inset-y-0 left-0 flex w-10 items-center justify-start bg-gradient-to-r from-card via-card to-transparent pb-2 text-lg leading-none text-muted-foreground transition-colors hover:text-foreground"
            >
              ‹
            </button>
          ) : null}
          {tabFade.right ? (
            <button
              type="button"
              aria-hidden="true"
              tabIndex={-1}
              onClick={() => scrollTabs(1)}
              className="absolute inset-y-0 right-0 flex w-10 items-center justify-end bg-gradient-to-l from-card via-card to-transparent pb-2 text-lg leading-none text-muted-foreground transition-colors hover:text-foreground"
            >
              ›
            </button>
          ) : null}
        </div>
        {canExport && file ? (
          <ExportMenu
            label={t("exifExportMenu")}
            items={[
              ["txt", t("exifExportTxt")],
              ["csv", t("exifExportCsv")],
              ["json", t("exifExportJson")],
            ]}
            onSelect={(format) => downloadMetadata(file.name, fullForFile.groups, format)}
          />
        ) : null}
      </div>

      {/* 두 패널을 같은 칸에 겹쳐 두고 숨긴 쪽도 자리를 유지한다 — 요약 패널이 높이를 정하므로 탭을 바꿔도 카드 높이가 변하지 않는다. */}
      <div className="relative">
      <div className="grid">
        <div
          role="tabpanel"
          id="exif-tabpanel-summary"
          aria-labelledby="exif-tab-summary"
          className={cn("col-start-1 row-start-1", activeKey !== "summary" && "invisible")}
        >
          <dl className="grid grid-cols-2 gap-y-3 text-sm">
            <Row label={t("camera")} value={hasData ? data.camera : null} />
            <Row label={t("lens")} value={hasData ? data.lens : null} />
            <Row label={t("shutter")} value={hasData ? data.shutterSpeedLabel : null} />
            <Row label={t("aperture")} value={hasData ? data.aperture : null} />
            <Row label={t("iso")} value={hasData ? data.iso : null} />
            <Row label={t("focalLength")} value={hasData ? data.focalLength : null} />
            <GpsRow
              label={t("gps")}
              gps={gps}
              viewMapLabel={t("viewOnMap")}
              onViewMap={() => setShowMap(true)}
              warnLabel={t("gpsWarningTitle")}
              onWarn={() => setGpsNoticeClosedFor(null)}
            />
            {/* 촬영 날짜·시간 — GPS 위치 바로 아래 (석한 요청, 2026-10-03). 값이 없으면 "—" */}
            <Row label={t("takenAtDateTime")} value={hasData ? data.takenAt : null} />
            <dt className="text-muted-foreground">{t("fileSize")}</dt>
            <dd className="flex items-center justify-end gap-2 text-right font-medium">
              <span>{fileSizeLabel ?? "—"}</span>
              {canCompress && file ? (
                <Link
                  href="/tools/image-compressor"
                  onClick={() => setHandoffFile(file)}
                  title={t("compressLinkTitle")}
                  className="shrink-0 text-primary underline underline-offset-2 hover:text-primary/80"
                >
                  {t("compressLink")}
                </Link>
              ) : null}
            </dd>
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">{t("exifEmpty")}</p>
        </div>

        {categories.length > 0 ? (
          <div
            role="tabpanel"
            id="exif-tabpanel-category"
            aria-labelledby={`exif-tab-${activeKey}`}
            className={cn("relative col-start-1 row-start-1", activeKey === "summary" && "invisible")}
          >
            <div className="absolute inset-0 flex flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                {activeCategory ? (
                  <dl className="grid grid-cols-[fit-content(62%)_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm">
                    {activeCategory.entries.map((e, i) => (
                      <React.Fragment key={`${activeCategory.key}-${e.name}-${i}`}>
                        <dt className="break-words text-muted-foreground">{e.name}</dt>
                        <dd className="break-all text-right font-medium">
                          {e.value}
                        </dd>
                      </React.Fragment>
                    ))}
                  </dl>
                ) : null}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{t("exifExportNote")}</p>
            </div>
          </div>
        ) : null}
      </div>

      </div>

      {showGpsNotice ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-5">
          <div
            role="dialog"
            aria-labelledby="exif-gps-notice-title"
            className="pointer-events-auto flex w-full max-w-sm flex-col gap-1 rounded-lg border border-destructive/60 bg-card px-3 py-3 text-xs shadow-lg"
          >
            <div className="flex items-start justify-between gap-3">
              <span id="exif-gps-notice-title" className="font-semibold text-destructive">
                {t("gpsWarningTitle")}
              </span>
              <button
                type="button"
                onClick={() => setGpsNoticeClosedFor(file)}
                aria-label={t("gpsMapClose")}
                title={t("gpsMapClose")}
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <span className="text-muted-foreground">{t("gpsWarningBody")}</span>
            {showRemoverLink ? (
              <Link
                href="/tools/exif-remover"
                className="w-fit font-medium text-destructive underline underline-offset-2 hover:opacity-80"
              >
                {t("gpsWarningLink")}
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      {showMap && gps ? (
        <GpsMapModal
          latitude={gps.latitude}
          longitude={gps.longitude}
          onClose={() => setShowMap(false)}
        />
      ) : null}
    </div>
  );
}
