"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { isSupportedImageFile, parseExifFile } from "@/lib/exif";
import { useExifStore } from "@/store/exif-store";

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100MB, generous for RAW files

/**
 * Shared "pick or drop a photo, parse its EXIF, store it" logic — used by
 * both the main uploader (src/components/exif-uploader.tsx) and the EXIF
 * Frame Generator's photo preview, so dropping a new photo directly onto
 * the frame preview replaces it in place instead of requiring a trip back
 * to the home page.
 */
export function usePhotoUpload() {
  const t = useTranslations("Home");
  const startLoading = useExifStore((s) => s.startLoading);
  const setSuccess = useExifStore((s) => s.setSuccess);
  const setError = useExifStore((s) => s.setError);

  const handleFile = React.useCallback(
    async (file: File | undefined) => {
      if (!file) return;

      if (!isSupportedImageFile(file)) {
        setError(t("uploaderErrorUnsupported"));
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(t("uploaderErrorTooLarge"));
        return;
      }

      startLoading(file.name);
      try {
        const parsed = await parseExifFile(file);
        setSuccess(parsed, URL.createObjectURL(file), file.type);
      } catch {
        setError(t("uploaderErrorParse"));
      }
    },
    [startLoading, setSuccess, setError, t],
  );

  return { handleFile };
}
