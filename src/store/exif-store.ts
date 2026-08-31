import { create } from "zustand";
import type { ParsedExif } from "@/lib/exif";

type ExifStatus = "idle" | "loading" | "success" | "error";

type ExifState = {
  status: ExifStatus;
  fileName: string | null;
  data: ParsedExif | null;
  /**
   * Object URL for the uploaded photo's raw bytes. Kept alongside the
   * parsed EXIF so other pages (e.g. the EXIF Frame Generator) can reuse
   * the same already-uploaded photo without asking the user to upload it
   * again. Revoked whenever it's replaced or cleared to avoid leaking
   * memory across a long session.
   */
  imageUrl: string | null;
  /**
   * The uploaded `File` itself, kept alongside `imageUrl` so consumers that
   * need the raw bytes — not just something an `<img>` can point at — can
   * get them back out. The EXIF Frame Generator uses this to detect
   * HEIC/HEIF (unrenderable) and RAW (needs its embedded JPEG preview
   * extracted via LibRaw — see `@/lib/raw-exif`) before attempting to draw
   * the photo onto a canvas (2026-08-31).
   */
  file: File | null;
  errorMessage: string | null;
  startLoading: (fileName: string) => void;
  setSuccess: (data: ParsedExif, imageUrl: string, file: File) => void;
  setError: (message: string) => void;
  reset: () => void;
};

function revoke(url: string | null) {
  if (url) URL.revokeObjectURL(url);
}

export const useExifStore = create<ExifState>((set, get) => ({
  status: "idle",
  fileName: null,
  data: null,
  imageUrl: null,
  file: null,
  errorMessage: null,
  startLoading: (fileName) => {
    revoke(get().imageUrl);
    set({
      status: "loading",
      fileName,
      errorMessage: null,
      data: null,
      imageUrl: null,
      file: null,
    });
  },
  setSuccess: (data, imageUrl, file) =>
    set({ status: "success", data, imageUrl, file, errorMessage: null }),
  setError: (message) => {
    revoke(get().imageUrl);
    set({
      status: "error",
      errorMessage: message,
      data: null,
      imageUrl: null,
      file: null,
    });
  },
  reset: () => {
    revoke(get().imageUrl);
    set({
      status: "idle",
      fileName: null,
      data: null,
      imageUrl: null,
      file: null,
      errorMessage: null,
    });
  },
}));
