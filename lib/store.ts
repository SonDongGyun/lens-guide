"use client";

import { create } from "zustand";
import type {
  PurposeId,
  DiscomfortId,
  LensTypeId,
  IndexId,
  CoatingId,
} from "./data";

export type ScreenId =
  | "welcome"
  | "purpose"
  | "discomfort"
  | "lens-type"
  | "thickness"
  | "coating"
  | "result"
  | "staff";

export const SCREEN_ORDER: ScreenId[] = [
  "welcome",
  "purpose",
  "discomfort",
  "lens-type",
  "thickness",
  "coating",
  "result",
  "staff",
];

interface WizardState {
  screen: ScreenId;
  direction: 1 | -1;
  ticket: string | null;
  purposes: PurposeId[];
  discomforts: DiscomfortId[];
  primaryConcern: DiscomfortId | null;
  lensType: LensTypeId;
  selectedIndex: IndexId;
  prescription: number; // diopter, e.g. -4
  coatings: CoatingId[];
  go: (s: ScreenId) => void;
  next: () => void;
  prev: () => void;
  togglePurpose: (id: PurposeId) => void;
  toggleDiscomfort: (id: DiscomfortId) => void;
  setPrimaryConcern: (id: DiscomfortId) => void;
  setLensType: (t: LensTypeId) => void;
  setIndex: (i: IndexId) => void;
  setPrescription: (n: number) => void;
  toggleCoating: (id: CoatingId) => void;
  setTicket: (t: string) => void;
  reset: () => void;
}

const initialState = {
  screen: "welcome" as ScreenId,
  direction: 1 as 1 | -1,
  ticket: null as string | null,
  purposes: [] as PurposeId[],
  discomforts: [] as DiscomfortId[],
  primaryConcern: null as DiscomfortId | null,
  lensType: "single" as LensTypeId,
  selectedIndex: "1.60" as IndexId,
  prescription: -4,
  coatings: [] as CoatingId[],
};

export const useWizard = create<WizardState>((set, get) => ({
  ...initialState,
  go: (s) => {
    const cur = SCREEN_ORDER.indexOf(get().screen);
    const nxt = SCREEN_ORDER.indexOf(s);
    set({ screen: s, direction: nxt >= cur ? 1 : -1 });
  },
  next: () => {
    const i = SCREEN_ORDER.indexOf(get().screen);
    if (i < SCREEN_ORDER.length - 1) {
      set({ screen: SCREEN_ORDER[i + 1], direction: 1 });
    }
  },
  prev: () => {
    const i = SCREEN_ORDER.indexOf(get().screen);
    if (i > 0) {
      set({ screen: SCREEN_ORDER[i - 1], direction: -1 });
    }
  },
  togglePurpose: (id) => {
    const cur = get().purposes;
    set({
      purposes: cur.includes(id) ? cur.filter((p) => p !== id) : [...cur, id],
    });
  },
  toggleDiscomfort: (id) => {
    const cur = get().discomforts;
    const next = cur.includes(id) ? cur.filter((p) => p !== id) : [...cur, id];
    const primary = get().primaryConcern;
    set({
      discomforts: next,
      primaryConcern: primary && next.includes(primary) ? primary : next[0] ?? null,
    });
  },
  setPrimaryConcern: (id) => set({ primaryConcern: id }),
  setLensType: (t) => set({ lensType: t }),
  setIndex: (i) => set({ selectedIndex: i }),
  setPrescription: (n) => set({ prescription: n }),
  toggleCoating: (id) => {
    const cur = get().coatings;
    set({ coatings: cur.includes(id) ? cur.filter((c) => c !== id) : [...cur, id] });
  },
  setTicket: (t) => set({ ticket: t }),
  reset: () => set({ ...initialState }),
}));
