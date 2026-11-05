/**
 * 가이드(글) → 관련 도구 매핑. 2026-11-05.
 * 각 가이드 하단 CTA와 "무료 도구" 링크가 글 주제와 맞는 도구를 가리키도록 한다.
 * 첫 번째 항목이 상단 CTA, 두 번째(없으면 첫 번째)가 하단 CTA, 전체(최대 3개)가 하단 도구 목록.
 * "home" = 홈의 EXIF 분석 & ND 필터 계산기("/"). 매핑에 없는 글은 기존 방식으로 동작한다.
 */
export const HOME_TOOL = "home";

const DOF = "dof-calculator";
const ADOF = "advanced-dof-diffraction-calculator";
const HYPER = "dof-hyperfocal-table";
const EXPO = "exposure-stops-calculator";
const BRACKET = "bracketing-calculator";
const ASTRO = "astrophotography-calculator";
const TIMELAPSE = "timelapse-calculator";
const SUNNY = "sunny-16-calculator";
const GOLDEN = "golden-hour-calculator";
const FOV = "camera-fov-calculator";
const CROP = "crop-factor-calculator";
const FLASH = "flash-guide-number-calculator";
const PRINT = "print-resolution-calculator";
const STORAGE = "storage-calculator";
const REMOVER = "exif-remover";
const SHUTTER = "shutter-count-checker";
const COMPRESS = "image-compressor";
const RESIZE = "image-resizer";
const CONVERT = "image-converter";
const WATERMARK = "image-watermark";
const MOSAIC = "image-mosaic";
const H = HOME_TOOL;

export const GUIDE_TOOLS: Record<string, string[]> = {
  "advanced-dof-diffraction-calculator-guide": [ADOF, DOF, HYPER],
  "astro-calculator-milky-way-planning": [ASTRO, EXPO, GOLDEN],
  "astro-calculator-npf-rule": [ASTRO, EXPO, FOV],
  "astrophotography-camera-settings-night-sky": [ASTRO, EXPO, FOV],
  "avoiding-camera-shake-long-exposure": [H, EXPO],
  "back-button-focus-explained": [DOF, HYPER, H],
  "beginners-guide-to-manual-mode": [EXPO, SUNNY, H],
  "bracketing-calculator-hdr-stops": [BRACKET, EXPO],
  "camera-field-of-view-calculator-guide": [FOV, CROP],
  "choosing-the-right-nd-filter": [H, EXPO],
  "color-space-srgb-vs-adobe-rgb": [CONVERT, H, PRINT],
  "crop-factor-calculator-lens-choice": [CROP, FOV],
  "diffraction-and-optimal-aperture": [ADOF, DOF],
  "dof-calculator-landscape-sharpness": [DOF, HYPER, ADOF],
  "dof-calculator-portrait-background-blur": [DOF, FOV, CROP],
  "exif-remover-social-media-privacy": [REMOVER, COMPRESS, MOSAIC],
  "exif-remover-stock-photo-submission": [REMOVER, RESIZE, CONVERT],
  "exposure-bracketing-hdr-basics": [BRACKET, EXPO],
  "exposure-calculator-nd-filter-long-exposure": [H, EXPO],
  "exposure-calculator-night-photography": [EXPO, ASTRO],
  "filter-stacking-guide": [H, EXPO],
  "flash-guide-number-calculator-guide": [FLASH, EXPO],
  "flash-sync-speed-explained": [FLASH, EXPO],
  "focus-modes-af-s-vs-af-c-vs-mf": [DOF, H],
  "focus-stacking-for-macro-photography": [ADOF, DOF, HYPER],
  "free-alternative-to-photopills-exposure-calculators": [EXPO, ASTRO, GOLDEN],
  "free-nd-filter-calculator-alternative-to-shootcalc": [H, EXPO],
  "golden-hour-calculator-guide": [GOLDEN, SUNNY],
  "gps-data-in-photos-privacy": [REMOVER, H, MOSAIC],
  "graduated-nd-filter-guide": [H, BRACKET],
  "how-to-add-exif-frame-to-photos": [H, WATERMARK],
  "how-to-choose-a-tripod": [EXPO, H],
  "how-to-read-a-histogram": [H, BRACKET, EXPO],
  "hyperfocal-distance-explained": [HYPER, DOF],
  "image-stabilization-explained": [EXPO, H],
  "landscape-waterfall-camera-settings": [H, EXPO],
  "light-trail-photography-camera-settings": [EXPO, H],
  "low-light-noise-reduction-settings": [EXPO, H],
  "macro-depth-of-field-vs-standard-dof": [ADOF, DOF],
  "macro-photography-basics": [DOF, ADOF],
  "macro-photography-diffraction-explained": [ADOF, DOF],
  "mirrorless-vs-dslr-explained": [SHUTTER, CROP],
  "nd-filter-types-explained": [H, EXPO],
  "nd-filter-vs-polarizer-filter": [H, EXPO],
  "night-cityscape-photography-settings": [GOLDEN, EXPO, H],
  "panning-shot-technique": [EXPO, H],
  "panorama-photography-settings": [FOV, HYPER, EXPO],
  "portrait-photography-camera-settings": [DOF, FOV, CROP],
  "prime-lens-vs-zoom-lens": [CROP, FOV],
  "print-resolution-calculator-album": [PRINT, RESIZE],
  "print-resolution-calculator-poster": [PRINT, RESIZE],
  "raw-vs-jpeg-which-should-you-shoot": [STORAGE, CONVERT],
  "sensor-size-and-crop-factor-explained": [CROP, FOV],
  "shutter-count-checker-guide": [SHUTTER, H],
  "six-frames-light-timing-and-composition": [H, GOLDEN, FOV],
  "storage-calculator-raw-vs-jpeg": [STORAGE, COMPRESS],
  "storage-calculator-trip-planning": [STORAGE, COMPRESS],
  "street-photography-exposure-settings": [SUNNY, EXPO],
  "studio-lighting-basics": [FLASH, EXPO],
  "sunrise-sunset-photography-camera-settings": [GOLDEN, BRACKET, SUNNY],
  "the-exposure-triangle-explained": [EXPO, SUNNY, H],
  "timelapse-calculator-interval-shooting": [TIMELAPSE, STORAGE],
  "timelapse-calculator-storage-planning": [TIMELAPSE, STORAGE],
  "timelapse-camera-settings": [TIMELAPSE, EXPO, STORAGE],
  "understanding-depth-of-field": [DOF, HYPER, FOV],
  "understanding-dynamic-range": [BRACKET, H],
  "understanding-exif-iso-shutter-aperture": [H, EXPO],
  "understanding-metering-modes": [EXPO, BRACKET, SUNNY],
  "using-exposure-compensation": [EXPO, BRACKET],
  "white-balance-explained": [H, GOLDEN],
  "wide-angle-vs-telephoto-focal-length": [FOV, CROP],
  "wildlife-photography-camera-settings": [EXPO, CROP, FOV],
};

export function getGuideTools(slug: string): string[] | null {
  return GUIDE_TOOLS[slug] ?? null;
}
