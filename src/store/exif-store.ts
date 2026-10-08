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
  /**
   * 이미지 압축기로 넘길 사진(2026-10-08). 홈의 "용량 줄이기" 바로가기를 누르면 여기에 담기고,
   * 압축기가 열리면서 한 번만 꺼내 목록에 자동으로 추가한다(꺼내면 비워지므로 나중에 압축기를
   * 다시 열어도 중복으로 들어가지 않는다). 브라우저 메모리 안에서만 이동하며 서버로 전송되지 않는다.
   * 새로고침하거나 주소를 직접 입력해 들어오면 비어 있다.
   */
  handoffFile: File | null;
  setHandoffFile: (file: File | null) => void;
  takeHandoffFile: () => File | null;
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
  handoffFile: null,
  setHandoffFile: (file) => set({ handoffFile: file }),
  takeHandoffFile: () => {
    const file = get().handoffFile;
    if (file) set({ handoffFile: null });
    return file;
  },
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
