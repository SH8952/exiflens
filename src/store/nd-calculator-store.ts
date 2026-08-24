import { create } from "zustand";
import {
  DEFAULT_BASE_SHUTTER_SECONDS,
  type NdFilterId,
} from "@/lib/nd-calculator";

type NdCalculatorState = {
  baseSeconds: number;
  /** Tracks which uploaded file's EXIF we last auto-filled from, so we
   *  don't clobber a manual override on every re-render. */
  lastAutoFilledFileName: string | null;
  filterId: NdFilterId;
  customStops: number;
  setBaseSeconds: (seconds: number) => void;
  setFilterId: (id: NdFilterId) => void;
  setCustomStops: (stops: number) => void;
  autoFillFromExif: (fileName: string, seconds: number) => void;
};

export const useNdCalculatorStore = create<NdCalculatorState>((set, get) => ({
  baseSeconds: DEFAULT_BASE_SHUTTER_SECONDS,
  lastAutoFilledFileName: null,
  filterId: "nd1000",
  customStops: 10,
  setBaseSeconds: (seconds) => set({ baseSeconds: seconds }),
  setFilterId: (id) => set({ filterId: id }),
  setCustomStops: (stops) => set({ customStops: stops }),
  autoFillFromExif: (fileName, seconds) => {
    if (get().lastAutoFilledFileName === fileName) return;
    set({ baseSeconds: seconds, lastAutoFilledFileName: fileName });
  },
}));
