"use client";

import { motion } from "framer-motion";
import type { LensTypeId } from "@/lib/data";

interface Props {
  lensType: LensTypeId;
  singleTarget: "far" | "near";
}

type SceneId = "far" | "mid" | "near";
type Tone = "clear" | "blurry" | "soft";

const SCENES: { id: SceneId; emoji: string; label: string }[] = [
  { id: "far", emoji: "🚗", label: "운전·먼 거리" },
  { id: "mid", emoji: "💻", label: "컴퓨터·중간거리" },
  { id: "near", emoji: "📖", label: "책·가까움" },
];

type SceneStatus = { tone: Tone; label: string };

const STATUS: Record<string, Record<SceneId, SceneStatus>> = {
  single_far: {
    near: { tone: "blurry", label: "책 글씨는 흐림" },
    mid: { tone: "blurry", label: "모니터 글씨 흐림" },
    far: { tone: "clear", label: "운전 시야 편함" },
  },
  single_near: {
    near: { tone: "clear", label: "책 읽기 편함" },
    mid: { tone: "blurry", label: "모니터 글씨 흐림" },
    far: { tone: "blurry", label: "먼 거리는 흐림" },
  },
  progressive: {
    near: { tone: "clear", label: "책 읽기 편함" },
    mid: { tone: "clear", label: "모니터 작업 편함" },
    far: { tone: "clear", label: "운전 시야 편함" },
  },
  office: {
    near: { tone: "clear", label: "책 읽기 편함" },
    mid: { tone: "clear", label: "모니터 작업 편함" },
    far: { tone: "soft", label: "먼 거리용으로는 맞지 않아요" },
  },
};

function statusKey(lensType: LensTypeId, singleTarget: "far" | "near"): string {
  return lensType === "single" ? `single_${singleTarget}` : lensType;
}

export function LensTypeVisual({ lensType, singleTarget }: Props) {
  const status = STATUS[statusKey(lensType, singleTarget)];

  const topRightBadge =
    lensType === "single"
      ? singleTarget === "far"
        ? "원거리용"
        : "근거리용"
      : lensType === "office"
        ? "실내 전용"
        : null;

  return (
    <div className="relative w-full aspect-[16/10] rounded-3xl overflow-hidden bg-gradient-to-b from-[#0F1A2B] via-[#1B2A45] to-[#0F1A2B] shadow-elevated">
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(123,97,255,0.35), transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(49,130,246,0.4), transparent 60%)",
        }}
      />

      {SCENES.map((s, i) => {
        const stat = status[s.id];
        const blur = stat.tone === "clear" ? 0 : 9;
        const opacity = stat.tone === "clear" ? 1 : 0.65;
        return (
          <div
            key={s.id}
            className="absolute left-0 right-0"
            style={{ top: `${i * 33.33}%`, height: "33.33%" }}
          >
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={false}
              animate={{ filter: `blur(${blur}px)`, opacity }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <SceneBand id={s.id} />
            </motion.div>
            <StatusChip tone={stat.tone} label={stat.label} />
          </div>
        );
      })}

      {lensType === "progressive" && <ProgressiveFlow />}

      {/* type label */}
      <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-semibold">
        {lensType === "single" && "단초점"}
        {lensType === "progressive" && "누진다초점"}
        {lensType === "office" && "오피스 렌즈"}
      </div>

      {topRightBadge && (
        <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white/12 backdrop-blur-md text-white text-xs font-semibold border border-white/15">
          {topRightBadge}
        </div>
      )}

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur text-white/70 text-[10px] font-medium tracking-wide">
        * 개념 시뮬레이션 — 실제 광학 효과와 다를 수 있습니다
      </div>
    </div>
  );
}

function StatusChip({ tone, label }: SceneStatus) {
  const styles =
    tone === "clear"
      ? "bg-accent-mint text-white"
      : tone === "soft"
        ? "bg-amber-400 text-ink-900"
        : "bg-white/15 text-white/80";
  const icon = tone === "clear" ? "✓" : tone === "soft" ? "!" : "✕";
  return (
    <div
      className={`absolute right-3 bottom-3 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-tight backdrop-blur shadow-soft ${styles}`}
    >
      <span className="mr-1">{icon}</span>
      {label}
    </div>
  );
}

function ProgressiveFlow() {
  return (
    <div className="absolute left-3 top-[14%] bottom-[14%] pointer-events-none flex flex-col items-center">
      <div className="w-0.5 flex-1 rounded-full bg-gradient-to-b from-brand via-purple-300 to-accent-mint opacity-70" />
      <div className="absolute -left-1 top-0 w-2.5 h-2.5 rounded-full bg-brand shadow-[0_0_12px_rgba(49,130,246,0.8)]" />
      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-purple-300 shadow-[0_0_12px_rgba(196,181,253,0.8)]" />
      <div className="absolute -left-1 bottom-0 w-2.5 h-2.5 rounded-full bg-accent-mint shadow-[0_0_12px_rgba(0,200,150,0.8)]" />
    </div>
  );
}

function SceneBand({ id }: { id: SceneId }) {
  if (id === "far") {
    return (
      <div className="w-full h-full relative flex items-center justify-center">
        <svg viewBox="0 0 800 200" className="w-[80%] h-full opacity-90">
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1B3A6B" />
              <stop offset="1" stopColor="#2C5BA8" />
            </linearGradient>
          </defs>
          <rect width="800" height="200" fill="url(#sky)" />
          <polygon points="350,200 450,200 520,80 280,80" fill="#222" />
          <rect x="395" y="100" width="10" height="14" rx="2" fill="#FBBF24" />
          <rect x="392" y="130" width="16" height="20" rx="2" fill="#FBBF24" />
          <rect x="388" y="170" width="24" height="28" rx="2" fill="#FBBF24" />
          <circle cx="380" cy="92" r="3" fill="#FFE08A" />
          <circle cx="420" cy="92" r="3" fill="#FFE08A" />
        </svg>
        <div className="absolute left-6 top-4 text-white/60 text-xs font-medium">
          🚗 운전·먼 거리
        </div>
      </div>
    );
  }
  if (id === "mid") {
    return (
      <div className="w-full h-full relative flex items-center justify-center">
        <div className="relative w-[60%] h-[78%] rounded-xl border-2 border-white/20 bg-gradient-to-b from-white/15 to-white/5 overflow-hidden">
          <div className="absolute inset-2 grid grid-cols-3 gap-1.5">
            <div className="bg-white/40 rounded" />
            <div className="bg-white/30 rounded col-span-2" />
            <div className="bg-white/25 rounded col-span-3 h-2" />
            <div className="bg-white/20 rounded col-span-3" />
            <div className="bg-white/35 rounded" />
            <div className="bg-white/20 rounded col-span-2" />
          </div>
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/30 rounded-b" />
        </div>
        <div className="absolute left-6 top-4 text-white/60 text-xs font-medium">
          💻 컴퓨터·중간거리
        </div>
      </div>
    );
  }
  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <div className="relative w-[70%] h-[80%] rounded-md bg-gradient-to-b from-white/85 to-white/70 shadow-2xl flex">
        <div className="flex-1 m-3 space-y-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-1.5 bg-ink-700/40 rounded"
              style={{ width: `${85 - (i % 3) * 10}%` }}
            />
          ))}
        </div>
        <div className="w-px bg-ink-700/20" />
        <div className="flex-1 m-3 space-y-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-1.5 bg-ink-700/40 rounded"
              style={{ width: `${80 - (i % 3) * 12}%` }}
            />
          ))}
        </div>
      </div>
      <div className="absolute left-6 top-4 text-white/60 text-xs font-medium">
        📖 책·가까움
      </div>
    </div>
  );
}
