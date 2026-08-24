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
  errorMessage: string | null;
  startLoading: (fileName: string) => void;
  setSuccess: (data: ParsedExif, imageUrl: string) => void;
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
  errorMessage: null,
  startLoading: (fileName) => {
    revoke(get().imageUrl);
    set({
      status: "loading",
      fileName,
      errorMessage: null,
      data: null,
      imageUrl: null,
    });
  },
  setSuccess: (data, imageUrl) =>
    set({ status: "success", data, imageUrl, errorMessage: null }),
  setError: (message) => {
    revoke(get().imageUrl);
    set({ status: "error", errorMessage: message, data: null, imageUrl: null });
  },
  reset: () => {
    revoke(get().imageUrl);
    set({
      status: "idle",
      fileName: null,
      data: null,
      imageUrl: null,
      errorMessage: null,
    });
  },
}));
