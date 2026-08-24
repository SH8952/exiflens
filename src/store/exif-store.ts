import { create } from "zustand";
import type { ParsedExif } from "@/lib/exif";

type ExifStatus = "idle" | "loading" | "success" | "error";

type ExifState = {
  status: ExifStatus;
  fileName: string | null;
  data: ParsedExif | null;
  errorMessage: string | null;
  startLoading: (fileName: string) => void;
  setSuccess: (data: ParsedExif) => void;
  setError: (message: string) => void;
  reset: () => void;
};

export const useExifStore = create<ExifState>((set) => ({
  status: "idle",
  fileName: null,
  data: null,
  errorMessage: null,
  startLoading: (fileName) =>
    set({ status: "loading", fileName, errorMessage: null, data: null }),
  setSuccess: (data) => set({ status: "success", data, errorMessage: null }),
  setError: (message) =>
    set({ status: "error", errorMessage: message, data: null }),
  reset: () => set({ status: "idle", fileName: null, data: null, errorMessage: null }),
}));
