/**
 * 홈 "전체 메타데이터" 탭용 — 사진에 들어 있는 메타데이터를 그룹별 목록으로 읽고, TXT/CSV/JSON 으로 내보낸다.
 * (2026-10-19) 모든 처리는 브라우저 안에서만 이루어지며 파일은 서버로 전송되지 않는다.
 *
 * - 요약 파서(`parseExifFile`)와 별개로, 탭을 열었을 때 한 번만 읽는다(공유 EXIF 저장소에는 넣지 않는다).
 * - 카메라 RAW(CR3·NEF 등)는 요약 파서가 LibRaw 경로를 쓰므로 이 탭에서는 지원하지 않는다.
 * - 썸네일·바이너리 값은 용량이 크고 읽을 수 없으므로 제외한다.
 */

/**
 * - lensName: 렌즈 사양의 최대 개방 조리개가 "알 수 없음(f/?)"으로 기록되어 있어 렌즈 모델명에서 읽어 채움
 * - noAperture: 모델명에서도 조리개를 찾지 못해 "조리개 정보 없음"으로 표기
 */
export type FullMetadataEntry = { name: string; value: string };
export type FullMetadataGroup = { group: string; entries: FullMetadataEntry[] };

const RAW_EXTENSION_RE = /\.(arw|cr2|cr3|nef|raf|rw2|orf|dng|pef|srw)$/i;

const GROUP_LABELS: Record<string, string> = {
  file: "File",
  jfif: "JFIF",
  exif: "EXIF",
  gps: "GPS",
  interoperability: "Interoperability",
  iptc: "IPTC",
  xmp: "XMP",
  icc: "ICC",
  photoshop: "Photoshop",
  composite: "Composite",
  makerNotes: "MakerNotes",
  png: "PNG",
  pngFile: "PNG",
  riff: "WebP",
};

/** 읽지 않는 그룹 — 썸네일(바이너리)과 다중 사진(MPF) 구조 정보. */
const SKIPPED_GROUPS = new Set(["Thumbnail", "thumbnail", "mpf"]);
/** 한 값의 최대 글자 수(너무 긴 값은 잘라서 보여 준다). */
const MAX_VALUE_LENGTH = 300;
/** 한 사진에서 보여 주는 최대 항목 수. */
const MAX_ENTRIES = 600;

export function isFullMetadataSupported(file: File): boolean {
  return !RAW_EXTENSION_RE.test(file.name);
}

function isBinary(value: unknown): boolean {
  return value instanceof ArrayBuffer || ArrayBuffer.isView(value);
}

function formatNumber(n: number): string {
  return Number.isInteger(n) ? String(n) : String(Number(n.toFixed(6)));
}

function stringify(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (isBinary(value)) return null;
  if (Array.isArray(value)) {
    if (value.some((v) => isBinary(v))) return null;
    const parts = value.map((v) => {
      // 분수 값([분자, 분모])은 "n/d" 로 보여 준다.
      if (Array.isArray(v) && v.length === 2 && v.every((x) => typeof x === "number")) {
        return `${v[0]}/${v[1]}`;
      }
      if (typeof v === "number") return formatNumber(v);
      return typeof v === "object" ? JSON.stringify(v) : String(v);
    });
    return parts.join(", ");
  }
  if (typeof value === "object") return null;
  if (typeof value === "number") return formatNumber(value);
  return String(value);
}

/**
 * 제조사 전용 값에는 빈 칸으로 채워진 배열이 흔하다(예: "RF24-70mm F2.8 L IS USM, , , , , …").
 * 널 문자와 빈 항목(연속된 쉼표)을 걷어 내고 끝의 쉼표를 지운다.
 */
function cleanValue(text: string): string {
  return text
    .replace(/\u0000/g, "")
    .replace(/(?:,\s*){2,}/g, ", ")
    .replace(/[,\s]+$/, "")
    .trim();
}

function readTagValue(tag: unknown): string | null {
  if (tag && typeof tag === "object" && !isBinary(tag) && !Array.isArray(tag)) {
    const t = tag as { description?: unknown; value?: unknown };
    const fromDescription = typeof t.description === "string" ? t.description : null;
    const raw = fromDescription ?? stringify(t.value);
    if (raw === null) return null;
    const text = cleanValue(raw);
    return text.length > MAX_VALUE_LENGTH ? `${text.slice(0, MAX_VALUE_LENGTH)}…` : text;
  }
  const raw = stringify(tag);
  if (raw === null) return null;
  const text = cleanValue(raw);
  return text.length > MAX_VALUE_LENGTH ? `${text.slice(0, MAX_VALUE_LENGTH)}…` : text;
}

export async function readFullMetadata(file: File): Promise<FullMetadataGroup[]> {
  const { default: ExifReader } = await import("exifreader");
  const tags = (await ExifReader.load(file, { expanded: true })) as unknown as Record<
    string,
    unknown
  >;

  const groups: FullMetadataGroup[] = [];
  let total = 0;
  for (const [groupKey, groupValue] of Object.entries(tags)) {
    if (SKIPPED_GROUPS.has(groupKey)) continue;
    if (!groupValue || typeof groupValue !== "object") continue;
    const entries: FullMetadataEntry[] = [];
    for (const [name, tag] of Object.entries(groupValue as Record<string, unknown>)) {
      if (total >= MAX_ENTRIES) break;
      if (name.startsWith("_") || name === "Thumbnail" || name === "MakerNote") continue;
      const value = readTagValue(tag);
      if (value === null || value === "") continue;
      entries.push({ name, value });
      total += 1;
    }
    if (entries.length > 0) {
      groups.push({ group: GROUP_LABELS[groupKey] ?? groupKey.toUpperCase(), entries });
    }
  }
  return groups;
}

// ─── 주제별 분류(2026-10-19) ───────────────────────────────────────────────
// 홈 "추출된 EXIF" 요약 탭에 이미 나오는 항목은 주제별 탭에서 뺀다(중복 방지). 내보내기 파일에는 전체를 담는다.

export type MetadataCategoryKey =
  | "image"
  | "shooting"
  | "camera"
  | "location"
  | "editing"
  | "copyright"
  | "xmp"
  | "color"
  | "other";

export type MetadataCategory = { key: MetadataCategoryKey; entries: FullMetadataEntry[] };

/** 탭에 보이는 순서. */
const CATEGORY_ORDER: MetadataCategoryKey[] = [
  "image",
  "shooting",
  "camera",
  "location",
  "editing",
  "copyright",
  "xmp",
  "color",
  "other",
];

/** 요약 탭(카메라·렌즈·셔터·조리개·ISO·초점거리·촬영 일시·GPS 좌표)에 이미 있는 항목 — EXIF/GPS 그룹에서만 제외한다. */
const SUMMARY_DUPLICATES = new Set(
  [
    "Make",
    "Model",
    "LensModel",
    "ExposureTime",
    "FNumber",
    "ISOSpeedRatings",
    "FocalLength",
    "DateTimeOriginal",
    "GPSLatitude",
    "GPSLongitude",
    "GPSLatitudeRef",
    "GPSLongitudeRef",
  ].map((n) => n.toLowerCase()),
);
const SUMMARY_GPS_DUPLICATES = new Set(["latitude", "longitude"]);

const toSet = (names: string[]) => new Set(names.map((n) => n.toLowerCase()));
const EXIF_IMAGE = toSet([
  "ImageWidth",
  "ImageLength",
  "PixelXDimension",
  "PixelYDimension",
  "XResolution",
  "YResolution",
  "ResolutionUnit",
  "Orientation",
  "ColorSpace",
  "ComponentsConfiguration",
  "Compression",
  "BitsPerSample",
  "SamplesPerPixel",
  "PhotometricInterpretation",
  "YCbCrPositioning",
  "ExifVersion",
  "FlashpixVersion",
]);
const EXIF_SHOOTING = toSet([
  "ExposureProgram",
  "ExposureBiasValue",
  "ExposureMode",
  "MeteringMode",
  "Flash",
  "FlashEnergy",
  "WhiteBalance",
  "LightSource",
  "SceneCaptureType",
  "SceneType",
  "Contrast",
  "Saturation",
  "Sharpness",
  "DigitalZoomRatio",
  "FocalLengthIn35mmFilm",
  "SubjectDistance",
  "SubjectDistanceRange",
  "MaxApertureValue",
  "ApertureValue",
  "ShutterSpeedValue",
  "BrightnessValue",
  "SensingMethod",
  "CustomRendered",
  "GainControl",
  "FileSource",
  "FocalPlaneXResolution",
  "FocalPlaneYResolution",
  "FocalPlaneResolutionUnit",
  "SensitivityType",
  "RecommendedExposureIndex",
  "ExposureIndex",
  "ISOSpeed",
  "StandardOutputSensitivity",
]);
const EXIF_CAMERA = toSet([
  "BodySerialNumber",
  "SerialNumber",
  "CameraSerialNumber",
  "InternalSerialNumber",
  "LensMake",
  "LensSerialNumber",
  "LensSpecification",
  "LensInfo",
  "OwnerName",
  "CameraOwnerName",
]);
const EXIF_EDITING = toSet([
  "Software",
  "ProcessingSoftware",
  "HostComputer",
  "DateTime",
  "DateTimeDigitized",
  "SubSecTime",
  "SubSecTimeOriginal",
  "SubSecTimeDigitized",
  "OffsetTime",
  "OffsetTimeOriginal",
  "OffsetTimeDigitized",
  "ModifyDate",
]);
const EXIF_COPYRIGHT = toSet([
  "Copyright",
  "Artist",
  "ImageDescription",
  "UserComment",
  "XPAuthor",
  "XPComment",
  "XPKeywords",
  "XPSubject",
  "XPTitle",
]);

const CAMERA_NAMES = new Set(["make", "model", "lensmodel"]);

/** 카메라·렌즈 탭 맨 위에 두는 순서. */
const CAMERA_TOP_ORDER = ["make", "bodymodel", "lensmake", "lensmodel"];

/** 항목 하나가 속할 주제. null 이면 보여 주지 않는다(중복·의미 없는 포인터 값). */
function categoryOf(group: string, name: string): MetadataCategoryKey | null {
  const lower = name.toLowerCase();
  if (group === "EXIF") {
    // 카메라 제조사·바디 이름·렌즈 모델은 요약 탭과 겹쳐도 카메라·렌즈 탭에 함께 보여 준다(2026-10-19 요청).
    if (CAMERA_NAMES.has(lower)) return "camera";
    if (SUMMARY_DUPLICATES.has(lower) || lower.endsWith("pointer")) return null;
    if (lower.startsWith("gps")) return "location";
    if (EXIF_IMAGE.has(lower)) return "image";
    if (EXIF_SHOOTING.has(lower)) return "shooting";
    if (EXIF_CAMERA.has(lower)) return "camera";
    if (EXIF_EDITING.has(lower)) return "editing";
    if (EXIF_COPYRIGHT.has(lower)) return "copyright";
    return "other";
  }
  if (group === "GPS") {
    return SUMMARY_GPS_DUPLICATES.has(lower) || SUMMARY_DUPLICATES.has(lower) ? null : "location";
  }
  if (group === "File" || group === "JFIF" || group === "PNG" || group === "WebP") return "image";
  if (group === "IPTC") return "copyright";
  if (group === "XMP") return "xmp";
  if (group === "ICC") return "color";
  if (group === "MakerNotes") return lower === "lensmodel" || !SUMMARY_DUPLICATES.has(lower) ? "camera" : null;
  return "other";
}

/**
 * 렌즈 모델명에서 최대 개방 조리개를 읽는다(예: "RF70-200mm F2.8 L IS USM" → "2.8", "RF100-500mm F4.5-7.1 L" → "4.5-7.1").
 * "RF70" 처럼 모델 이름 속 F 는 단어 경계(\b)로 걸러낸다. 찾지 못하면 null.
 */
export function apertureFromLensName(lensName: string): string | null {
  const m =
    lensName.match(/\bf\s*\/?\s*(\d+(?:\.\d+)?)(?:\s*[-–]\s*(\d+(?:\.\d+)?))?/i) ??
    lensName.match(/\b1\s*:\s*(\d+(?:\.\d+)?)(?:\s*[-–]\s*(\d+(?:\.\d+)?))?/);
  if (!m) return null;
  const a = Number(m[1]);
  const b = m[2] ? Number(m[2]) : null;
  const ok = (n: number) => n >= 0.7 && n <= 64;
  if (!ok(a) || (b !== null && !ok(b))) return null;
  return b !== null && b !== a ? `${m[1]}-${m[2]}` : m[1];
}

/** 렌즈 사양 값 끝의 "f/…" 부분 — 조리개가 "?"(0/0) 또는 0 으로만 기록되어 있으면 알 수 없음으로 본다(제조사에 따라 f/? 또는 f/0 으로 기록됨). */
const LENS_SPEC_APERTURE_RE = /\s*f\/\s*([^\s]+)\s*$/i;

function isUnknownAperture(part: string): boolean {
  return part
    .split("-")
    .every((token) => token === "?" || (token !== "" && Number.isFinite(Number(token)) && Number(token) === 0));
}

/** 렌즈 사양(LensSpecification)의 최대 개방 조리개가 알 수 없음(f/? 또는 f/0)일 때만 보충한다 — 화면 표시 전용, 내보내기에는 원본 유지. */
function supplementLensSpecification(entry: FullMetadataEntry, lensName: string | null): FullMetadataEntry {
  if (entry.name.toLowerCase() !== "lensspecification") return entry;
  const m = entry.value.match(LENS_SPEC_APERTURE_RE);
  if (!m || !isUnknownAperture(m[1])) return entry;
  const base = entry.value.replace(LENS_SPEC_APERTURE_RE, "").trim();
  const aperture = lensName ? apertureFromLensName(lensName) : null;
  if (aperture) return { ...entry, value: `${base} f/${aperture}` };
  return { ...entry, value: base };
}

/** 전체 메타데이터를 주제별로 나눈다. 항목이 하나도 없는 주제는 빠진다. */
export function categorizeMetadata(groups: FullMetadataGroup[]): MetadataCategory[] {
  const buckets = new Map<MetadataCategoryKey, FullMetadataEntry[]>();
  const lensName =
    groups
      .flatMap((g) => g.entries)
      .find((e) => e.name.toLowerCase() === "lensmodel")?.value ?? null;
  const exifHasLensModel = groups.some(
    (g) => g.group === "EXIF" && g.entries.some((e) => e.name.toLowerCase() === "lensmodel"),
  );
  for (const g of groups) {
    for (const rawEntry of g.entries) {
      const key = categoryOf(g.group, rawEntry.name);
      if (!key) continue;
      // 제조사 전용 영역의 렌즈 모델은 EXIF 에 같은 항목이 있으면 건너뛴다(같은 값이 두 번 나오지 않게).
      if (g.group === "MakerNotes" && rawEntry.name.toLowerCase() === "lensmodel" && exifHasLensModel) continue;
      // 화면에서는 카메라 바디 이름(Model)을 렌즈 모델(LensModel)과 짝이 맞게 BodyModel 로 보여 준다(내보내기 파일은 원본 이름 Model 유지).
      const named =
        key === "camera" && g.group === "EXIF" && rawEntry.name === "Model"
          ? { ...rawEntry, name: "BodyModel" }
          : rawEntry;
      const e = supplementLensSpecification(named, lensName);
      const list = buckets.get(key);
      if (list) list.push(e);
      else buckets.set(key, [e]);
    }
  }
  const cam = buckets.get("camera");
  if (cam) {
    const rank = (n: string) => {
      const i = CAMERA_TOP_ORDER.indexOf(n.toLowerCase());
      return i < 0 ? CAMERA_TOP_ORDER.length : i;
    };
    buckets.set(
      "camera",
      cam.map((e, i) => ({ e, i })).sort((x, y) => rank(x.e.name) - rank(y.e.name) || x.i - y.i).map((x) => x.e),
    );
  }
  return CATEGORY_ORDER.filter((k) => buckets.has(k)).map((k) => ({
    key: k,
    entries: buckets.get(k) as FullMetadataEntry[],
  }));
}

function baseName(fileName: string): string {
  const i = fileName.lastIndexOf(".");
  return i > 0 ? fileName.slice(0, i) : fileName;
}

export function toTxt(groups: FullMetadataGroup[]): string {
  return groups
    .map((g) => `[${g.group}]\n${g.entries.map((e) => `${e.name}: ${e.value}`).join("\n")}`)
    .join("\n\n");
}

function csvCell(raw: string): string {
  // 엑셀이 수식으로 해석하지 않도록 =, +, @ (그리고 숫자가 아닌 -) 로 시작하는 값은 앞에 ' 를 붙인다.
  const safe = /^[=+@\t\r]|^-(?![\d.])/.test(raw) ? `'${raw}` : raw;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function toCsv(groups: FullMetadataGroup[]): string {
  const rows = ["group,tag,value"];
  for (const g of groups) {
    for (const e of g.entries) {
      rows.push([csvCell(g.group), csvCell(e.name), csvCell(e.value)].join(","));
    }
  }
  return rows.join("\r\n");
}

export function toJson(fileName: string, groups: FullMetadataGroup[]): string {
  const metadata: Record<string, Record<string, string>> = {};
  for (const g of groups) {
    metadata[g.group] = { ...(metadata[g.group] ?? {}), ...Object.fromEntries(g.entries.map((e) => [e.name, e.value])) };
  }
  return JSON.stringify({ fileName, metadata }, null, 2);
}

export type MetadataExportFormat = "txt" | "csv" | "json";

/** 메타데이터를 파일로 만들어 브라우저에서 바로 내려받는다(서버 전송 없음). */
export function downloadMetadata(
  fileName: string,
  groups: FullMetadataGroup[],
  format: MetadataExportFormat,
): void {
  const content =
    format === "txt" ? toTxt(groups) : format === "csv" ? toCsv(groups) : toJson(fileName, groups);
  const mime =
    format === "txt"
      ? "text/plain;charset=utf-8"
      : format === "csv"
        ? "text/csv;charset=utf-8"
        : "application/json;charset=utf-8";
  // CSV 는 한글이 엑셀에서 깨지지 않도록 BOM 을 붙인다.
  const blob = new Blob([format === "csv" ? `﻿${content}` : content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${baseName(fileName)}-metadata.${format}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
