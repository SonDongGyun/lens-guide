"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  WearPatternId,
  CorrectionTypeId,
  ContactDiscomfortId,
  MaterialId,
  ReplacementId,
  CosmeticEffectId,
} from "./data";

export type ContactsScreenId =
  | "welcome"
  | "wear-pattern"
  | "correction"
  | "discomfort"
  | "material"
  | "replacement"
  | "cosmetic"
  | "result"
  | "staff";

export const CONTACTS_SCREEN_ORDER: ContactsScreenId[] = [
  "welcome",
  "wear-pattern",
  "correction",
  "discomfort",
  "material",
  "replacement",
  "cosmetic",
  "result",
  "staff",
];

interface ContactsWizardState {
  screen: ContactsScreenId;
  direction: 1 | -1;
  ticket: string | null;
  wearPattern: WearPatternId | null;
  correctionType: CorrectionTypeId | null;
  discomforts: ContactDiscomfortId[];
  primaryDiscomfort: ContactDiscomfortId | null;
  // null = follow recommendation. Once user explicitly picks on the
  // material/replacement comparison screens, it pins their choice.
  selectedMaterial: MaterialId | null;
  selectedReplacement: ReplacementId | null;
  cosmeticEffect: CosmeticEffectId;
  go: (s: ContactsScreenId) => void;
  next: () => void;
  prev: () => void;
  setWearPattern: (p: WearPatternId) => void;
  setCorrectionType: (t: CorrectionTypeId) => void;
  toggleDiscomfort: (id: ContactDiscomfortId) => void;
  setPrimaryDiscomfort: (id: ContactDiscomfortId) => void;
  setMaterial: (m: MaterialId | null) => void;
  setReplacement: (r: ReplacementId | null) => void;
  setCosmeticEffect: (e: CosmeticEffectId) => void;
  setTicket: (t: string) => void;
  reset: () => void;
}

const initialState = {
  screen: "welcome" as ContactsScreenId,
  direction: 1 as 1 | -1,
  ticket: null as string | null,
  wearPattern: null as WearPatternId | null,
  correctionType: null as CorrectionTypeId | null,
  discomforts: [] as ContactDiscomfortId[],
  primaryDiscomfort: null as ContactDiscomfortId | null,
  selectedMaterial: null as MaterialId | null,
  selectedReplacement: null as ReplacementId | null,
  cosmeticEffect: "clear" as CosmeticEffectId,
};

const STORAGE_KEY = "lens-guide:contacts:v1";
const TTL_MS = 24 * 60 * 60 * 1000;

// Same TTL rationale as the eyeglass store: pre-visit mobile users may
// finish hours after first opening, but anything > 24h is almost
// certainly a different intent. Stamped via partialize on every set,
// checked via merge on rehydrate.
type PersistedSlice = Pick<
  ContactsWizardState,
  | "screen"
  | "ticket"
  | "wearPattern"
  | "correctionType"
  | "discomforts"
  | "primaryDiscomfort"
  | "selectedMaterial"
  | "selectedReplacement"
  | "cosmeticEffect"
> & { lastUpdatedAt: number };

export const useContactsWizard = create<ContactsWizardState>()(
  persist(
    (set, get) => ({
      ...initialState,
      go: (s) => {
        const cur = CONTACTS_SCREEN_ORDER.indexOf(get().screen);
        const nxt = CONTACTS_SCREEN_ORDER.indexOf(s);
        set({ screen: s, direction: nxt >= cur ? 1 : -1 });
      },
      next: () => {
        const i = CONTACTS_SCREEN_ORDER.indexOf(get().screen);
        if (i < CONTACTS_SCREEN_ORDER.length - 1) {
          set({ screen: CONTACTS_SCREEN_ORDER[i + 1], direction: 1 });
        }
      },
      prev: () => {
        const i = CONTACTS_SCREEN_ORDER.indexOf(get().screen);
        if (i > 0) {
          set({ screen: CONTACTS_SCREEN_ORDER[i - 1], direction: -1 });
        }
      },
      setWearPattern: (p) => set({ wearPattern: p }),
      setCorrectionType: (t) => set({ correctionType: t }),
      toggleDiscomfort: (id) => {
        const cur = get().discomforts;
        const next = cur.includes(id) ? cur.filter((d) => d !== id) : [...cur, id];
        const primary = get().primaryDiscomfort;
        set({
          discomforts: next,
          primaryDiscomfort:
            primary && next.includes(primary) ? primary : next[0] ?? null,
        });
      },
      setPrimaryDiscomfort: (id) => set({ primaryDiscomfort: id }),
      setMaterial: (m) => set({ selectedMaterial: m }),
      setReplacement: (r) => set({ selectedReplacement: r }),
      setCosmeticEffect: (e) => set({ cosmeticEffect: e }),
      setTicket: (t) => set({ ticket: t }),
      reset: () => {
        set({ ...initialState });
        useContactsWizard.persist.clearStorage();
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      skipHydration: true,
      partialize: (state): PersistedSlice => ({
        screen: state.screen,
        ticket: state.ticket,
        wearPattern: state.wearPattern,
        correctionType: state.correctionType,
        discomforts: state.discomforts,
        primaryDiscomfort: state.primaryDiscomfort,
        selectedMaterial: state.selectedMaterial,
        selectedReplacement: state.selectedReplacement,
        cosmeticEffect: state.cosmeticEffect,
        lastUpdatedAt: Date.now(),
      }),
      merge: (persisted, current) => {
        const p = persisted as PersistedSlice | undefined;
        if (
          !p ||
          typeof p.lastUpdatedAt !== "number" ||
          Date.now() - p.lastUpdatedAt > TTL_MS
        ) {
          return current;
        }
        const { lastUpdatedAt: _ts, ...slice } = p;
        return { ...current, ...slice };
      },
    }
  )
);
