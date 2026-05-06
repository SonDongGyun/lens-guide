"use client";

import { create } from "zustand";
import {
  persist,
  type PersistStorage,
  type StorageValue,
} from "zustand/middleware";
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

export type SingleTarget = "far" | "near";

interface WizardState {
  screen: ScreenId;
  direction: 1 | -1;
  ticket: string | null;
  purposes: PurposeId[];
  discomforts: DiscomfortId[];
  primaryConcern: DiscomfortId | null;
  lensType: LensTypeId;
  singleTarget: SingleTarget;
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
  setSingleTarget: (t: SingleTarget) => void;
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
  singleTarget: "far" as SingleTarget,
  selectedIndex: "1.60" as IndexId,
  prescription: -4,
  coatings: [] as CoatingId[],
};

const STORAGE_KEY = "lens-guide:wizard:v1";
const TTL_MS = 24 * 60 * 60 * 1000; // 24h: a realistic pre-visit window

// Pre-visit mobile users may finish the wizard hours later (commute,
// answering a call, putting the phone down). We persist enough state
// to resume — but anything older than 24h is almost certainly a
// different intent, so we drop it and start fresh.
//
// We wrap zustand's StorageValue with our own { timestamp, value }
// envelope so the TTL check is independent of the persisted schema.
type PersistedSlice = Pick<
  WizardState,
  | "screen"
  | "ticket"
  | "purposes"
  | "discomforts"
  | "primaryConcern"
  | "lensType"
  | "singleTarget"
  | "selectedIndex"
  | "prescription"
  | "coatings"
>;

interface TtlEnvelope {
  timestamp: number;
  value: StorageValue<PersistedSlice>;
}

const ttlStorage: PersistStorage<PersistedSlice> = {
  getItem: (name) => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(name);
      if (!raw) return null;
      const env = JSON.parse(raw) as TtlEnvelope;
      if (
        !env ||
        typeof env.timestamp !== "number" ||
        Date.now() - env.timestamp > TTL_MS
      ) {
        window.localStorage.removeItem(name);
        return null;
      }
      return env.value;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    if (typeof window === "undefined") return;
    try {
      const env: TtlEnvelope = { timestamp: Date.now(), value };
      window.localStorage.setItem(name, JSON.stringify(env));
    } catch {
      // Quota / private mode — silently drop. The store still works
      // in-memory; the user just loses cross-session resume.
    }
  },
  removeItem: (name) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};

export const useWizard = create<WizardState>()(
  persist(
    (set, get) => ({
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
      setSingleTarget: (t) => set({ singleTarget: t }),
      setIndex: (i) => set({ selectedIndex: i }),
      setPrescription: (n) => set({ prescription: n }),
      toggleCoating: (id) => {
        const cur = get().coatings;
        set({ coatings: cur.includes(id) ? cur.filter((c) => c !== id) : [...cur, id] });
      },
      setTicket: (t) => set({ ticket: t }),
      reset: () => {
        set({ ...initialState });
        // reset() is the user's "처음으로" action. Clear the persisted
        // envelope too so a tab close right after reset doesn't restore
        // stale data on next open.
        if (typeof window !== "undefined") {
          try {
            window.localStorage.removeItem(STORAGE_KEY);
          } catch {
            /* ignore */
          }
        }
      },
    }),
    {
      name: STORAGE_KEY,
      storage: ttlStorage,
      version: 1,
      // Rehydration runs on demand from a top-level useEffect rather
      // than at module load. Without this, sync localStorage rehydrate
      // races SSR: the server HTML reflects initial state, the client's
      // first React render uses restored state, and React reports a
      // hydration mismatch that flashes a re-render. skipHydration
      // keeps both paints identical and defers the resume jump to
      // after first paint, where it's expected.
      skipHydration: true,
      // direction is a transient animation hint; do not restore it.
      // Functions are auto-skipped by persist.
      partialize: (state) => ({
        screen: state.screen,
        ticket: state.ticket,
        purposes: state.purposes,
        discomforts: state.discomforts,
        primaryConcern: state.primaryConcern,
        lensType: state.lensType,
        singleTarget: state.singleTarget,
        selectedIndex: state.selectedIndex,
        prescription: state.prescription,
        coatings: state.coatings,
      }),
    }
  )
);
