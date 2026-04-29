"use client";

import { motion } from "framer-motion";
import type { LensTypeId } from "@/lib/data";

interface Props {
  lensType: LensTypeId;
  /** 0..1 — vertical gaze position (0 = top/far, 1 = bottom/near) */
  gaze: number;
}

// Each "scene" is composed of 3 stacked bands:
//   far (top)     — TV / road
//   mid (middle)  — computer
//   near (bottom) — book

const SCENES = [
  { id: "far", emoji: "🚗", label: "운전·먼 거리" },
  { id: "mid", emoji: "💻", label: "컴퓨터·중간거리" },
  { id: "near", emoji: "📖", label: "책·가까움" },
] as const;

function blurForBand(lensType: LensTypeId, band: "far" | "mid" | "near", gaze: number) {
  // band centers in [0,1]: far=0.18, mid=0.5, near=0.82
  const centers: Record<typeof band, number> = { far: 0.18, mid: 0.5, near: 0.82 };
  const dist = Math.abs(centers[band] - gaze);

  if (lensType === "single") {
    // single vision: only "far" band stays sharp regardless of gaze
    if (band === "far") return 0;
    return 10;
  }
  if (lensType === "office") {
    if (band === "far") return 8; // far always blurry
    return Math.max(0, dist * 14 - 1);
  }
  // progressive
  return Math.max(0, dist * 18 - 0.6);
}

export function LensTypeVisual({ lensType, gaze }: Props) {
  return (
    <div className="relative w-full aspect-[16/10] rounded-3xl overflow-hidden bg-gradient-to-b from-[#0F1A2B] via-[#1B2A45] to-[#0F1A2B] shadow-elevated">
      {/* dramatic ambient backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(123,97,255,0.35), transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(49,130,246,0.4), transparent 60%)",
        }}
      />

      {/* scene bands */}
      {SCENES.map((s, i) => {
        const blur = blurForBand(lensType, s.id, gaze);
        return (
          <motion.div
            key={s.id}
            className="absolute left-0 right-0 flex items-center justify-center"
            style={{
              top: `${i * 33.33}%`,
              height: "33.33%",
            }}
            initial={false}
            animate={{ filter: `blur(${blur}px)` }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <SceneBand id={s.id} />
          </motion.div>
        );
      })}

      {/* gaze indicator */}
      <motion.div
        className="absolute left-2 right-2 pointer-events-none"
        initial={false}
        animate={{ top: `calc(${gaze * 100}% - 1px)` }}
        transition={{ type: "spring", stiffness: 220, damping: 26 }}
      >
        <div className="h-0.5 bg-white/40 rounded-full" />
        <div className="absolute -left-1 -top-2 w-3 h-3 rounded-full bg-white shadow-glow" />
        <div className="absolute -right-1 -top-2 w-3 h-3 rounded-full bg-white shadow-glow" />
      </motion.div>

      {/* lens overlay with active zone for progressive */}
      {lensType === "progressive" && (
        <ProgressiveZoneOverlay gaze={gaze} />
      )}
      {lensType === "office" && <OfficeZoneOverlay />}
      {lensType === "single" && <SingleZoneOverlay />}

      {/* legend */}
      <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-semibold">
        {lensType === "single" && "단초점 — 한 거리에 또렷"}
        {lensType === "progressive" && "누진 — 시선에 따라 변화"}
        {lensType === "office" && "오피스 — 중간/근거리 강화"}
      </div>

      {/* disclaimer */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur text-white/70 text-[10px] font-medium tracking-wide">
        * 개념 시뮬레이션 — 실제 광학 효과와 다를 수 있습니다
      </div>
    </div>
  );
}

function SceneBand({ id }: { id: "far" | "mid" | "near" }) {
  if (id === "far") {
    return (
      <div className="w-full h-full relative flex items-center justify-center">
        {/* road perspective */}
        <svg viewBox="0 0 800 200" className="w-[80%] h-full opacity-90">
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1B3A6B" />
              <stop offset="1" stopColor="#2C5BA8" />
            </linearGradient>
          </defs>
          <rect width="800" height="200" fill="url(#sky)" />
          {/* road */}
          <polygon points="350,200 450,200 520,80 280,80" fill="#222" />
          {/* lane lines */}
          <rect x="395" y="100" width="10" height="14" rx="2" fill="#FBBF24" />
          <rect x="392" y="130" width="16" height="20" rx="2" fill="#FBBF24" />
          <rect x="388" y="170" width="24" height="28" rx="2" fill="#FBBF24" />
          {/* headlights ahead */}
          <circle cx="380" cy="92" r="3" fill="#FFE08A" />
          <circle cx="420" cy="92" r="3" fill="#FFE08A" />
        </svg>
        <div className="absolute right-6 top-6 text-white/70 text-xs">먼 거리</div>
      </div>
    );
  }
  if (id === "mid") {
    return (
      <div className="w-full h-full relative flex items-center justify-center">
        {/* monitor */}
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
        <div className="absolute right-6 top-6 text-white/70 text-xs">중간거리</div>
      </div>
    );
  }
  return (
    <div className="w-full h-full relative flex items-center justify-center">
      {/* book */}
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
      <div className="absolute right-6 top-6 text-white/70 text-xs">가까움</div>
    </div>
  );
}

function ProgressiveZoneOverlay({ gaze }: { gaze: number }) {
  // top = far zone (narrow at very top), middle = mid, bottom = near (wide)
  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <linearGradient id="prog" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3182F6" stopOpacity="0.0" />
            <stop offset="20%" stopColor="#3182F6" stopOpacity="0.18" />
            <stop offset="50%" stopColor="#7B61FF" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#00C896" stopOpacity="0.18" />
          </linearGradient>
        </defs>
        {/* hourglass-like clear zone */}
        <path
          d="M0 0 L100 0 L60 50 L100 100 L0 100 L40 50 Z"
          fill="url(#prog)"
        />
        {/* moving focus dot */}
        <circle
          cx="50"
          cy={gaze * 100}
          r="2"
          fill="#FFFFFF"
          opacity="0.9"
        />
      </svg>
      <div className="absolute right-4 bottom-4 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur text-white/80 text-[10px] font-semibold">
        시선 위치에 따라 또렷한 영역이 이동
      </div>
    </div>
  );
}

function SingleZoneOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute left-0 right-0 top-0 h-1/3"
        style={{
          background:
            "linear-gradient(to bottom, rgba(49,130,246,0.18), transparent)",
        }}
      />
      <div className="absolute left-4 top-4 px-2.5 py-1 rounded-full bg-brand/30 backdrop-blur text-white text-[10px] font-semibold">
        또렷 영역: 먼 거리
      </div>
    </div>
  );
}

function OfficeZoneOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute left-0 right-0 top-1/3 bottom-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(123,97,255,0.1), rgba(0,200,150,0.18))",
        }}
      />
      <div className="absolute left-4 bottom-4 px-2.5 py-1 rounded-full bg-accent-mint/30 backdrop-blur text-white text-[10px] font-semibold">
        또렷 영역: 중간 + 가까움
      </div>
    </div>
  );
}
