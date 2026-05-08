"use client";

import type {
  WearPatternId,
  CorrectionTypeId,
  ContactDiscomfortId,
  MaterialId,
  ReplacementId,
  CosmeticEffectId,
} from "./data";

// Parallel to lib/storage.ts but keyed separately so contact-lens
// consultations don't collide with eyeglass ones in localStorage.
// makeTicket itself is shared (lib/storage.makeTicket) — only the
// shape and key differ here.

export interface ContactsConsultationRecord {
  ticket: string;
  createdAt: string; // ISO
  wearPattern: WearPatternId | null;
  correctionType: CorrectionTypeId | null;
  discomforts: ContactDiscomfortId[];
  primaryDiscomfort: ContactDiscomfortId | null;
  material: MaterialId;
  replacement: ReplacementId;
  cosmeticEffect: CosmeticEffectId;
  brief: string;
}

const STORAGE_KEY = "lens-guide:contacts-consultations";
const MAX_RECORDS = 20;

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadContactsConsultations(): ContactsConsultationRecord[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveContactsConsultation(record: ContactsConsultationRecord): void {
  if (!isBrowser()) return;
  try {
    const existing = loadContactsConsultations();
    const filtered = existing.filter((r) => r.ticket !== record.ticket);
    const next = [record, ...filtered].slice(0, MAX_RECORDS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* swallow — storage quota / private mode */
  }
}
