"use client";

import type {
  PurposeId,
  DiscomfortId,
  LensTypeId,
  IndexId,
  CoatingId,
} from "./data";

export interface ConsultationRecord {
  ticket: string;
  createdAt: string; // ISO
  purposes: PurposeId[];
  discomforts: DiscomfortId[];
  primaryConcern: DiscomfortId | null;
  prescription: number;
  lensType: LensTypeId;
  selectedIndex: IndexId;
  coatings: CoatingId[];
  brief: string;
  demoSingleTarget?: "far" | "near";
}

const STORAGE_KEY = "lens-guide:consultations";
const MAX_RECORDS = 20;

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadConsultations(): ConsultationRecord[] {
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

export function saveConsultation(record: ConsultationRecord): void {
  if (!isBrowser()) return;
  try {
    const existing = loadConsultations();
    // dedupe by ticket within same session
    const filtered = existing.filter((r) => r.ticket !== record.ticket);
    const next = [record, ...filtered].slice(0, MAX_RECORDS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* swallow — storage quota / private mode */
  }
}

export function makeTicket(): string {
  // YYMMDDHHMM in store-local (KST) so the ticket date matches the staff's wall clock
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const stamp = kst.toISOString().replace(/[-:T]/g, "").slice(2, 12);
  const rand = Math.floor(100 + Math.random() * 900);
  return `${stamp}-${rand}`;
}
