"use client";

import * as React from "react";
import { isCanvasUnsupportedFormat } from "@/lib/exif";
import { extractRawPreviewBlob, isRawExtension } from "@/lib/raw-exif";

/**
 * Resolves a browser-renderable `<img src>` for the uploaded photo, so the
 * main EXIF uploader can show the same actual-photo preview the EXIF Frame
 * Generator already shows, instead of just a filename (2026-08-31, 석한 요청).
 *
 * - Standard image files (JPG/PNG/WebP/...): the original object URL is
 *   already renderable, returned as-is.
 * - RAW files (.cr2/.cr3/.arw/.dng/...): no browser can decode RAW sensor
 *   data directly, so this extracts the embedded JPEG preview via LibRaw —
 *   the same approach `exif-frame-generator.tsx` uses. A RAW file with no
 *   usable embedded preview (rare, but possible) resolves to `null`.
 * - HEIC/HEIF: no browser-renderable preview exists at all; resolves to
 *   `null` immediately.
 *
 * Returns `null` while resolving or when no preview could be produced —
 * callers should fall back to filename-only display in that case.
 */
export function usePhotoPreviewUrl(
  file: File | null,
  imageUrl: string | null,
  fileName: string | null,
): string | null {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    let revocableUrl: string | null = null;
    // Deliberate: unlike the Frame Generator's editor (which remounts per
    // photo via `key={imageUrl}`), this hook's caller (the uploader) stays
    // mounted across photo changes, so the previous photo's preview must be
    // cleared explicitly here before resolving the new one.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreviewUrl(null);

    if (!imageUrl) {
      return;
    }

    if (isCanvasUnsupportedFormat(fileName ?? "", file?.type ?? null)) {
      return; // HEIC/HEIF — no browser-renderable preview exists.
    }

    if (isRawExtension(fileName ?? "") && file) {
      extractRawPreviewBlob(file).then((blob) => {
        if (cancelled || !blob) return;
        const url = URL.createObjectURL(blob);
        revocableUrl = url;
        setPreviewUrl(url);
      });
      return () => {
        cancelled = true;
        if (revocableUrl) URL.revokeObjectURL(revocableUrl);
      };
    }

    setPreviewUrl(imageUrl);
    return () => {
      cancelled = true;
    };
  }, [file, imageUrl, fileName]);

  return previewUrl;
}
