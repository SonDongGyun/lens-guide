"use client";

import { motion } from "framer-motion";
import type { LensTypeId } from "@/lib/data";
import { cn } from "@/lib/utils";

interface Props {
  lensType: LensTypeId;
  singleTarget: "far" | "near";
}

type SceneId = "far" | "mid" | "near";
type Tone = "clear" | "blurry" | "soft";

const SCENES: { id: SceneId; emoji: string; label: string }[] = [
  { id: "far", emoji: "🚗", label: "운전 · 먼 거리" },
  { id: "mid", emoji: "💻", label: "모니터 · 중간 거리" },
  { id: "near", emoji: "📖", label: "책 · 가까운 거리" },
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
    <div className="relative w-full aspect-[3/4] sm:aspect-[1/1] rounded-3xl overflow-hidden bg-gradient-to-b from-[#0F1A2B] via-[#1B2A45] to-[#0F1A2B] shadow-elevated">
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(123,97,255,0.30), transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(49,130,246,0.32), transparent 60%)",
        }}
      />

      {/* type label */}
      <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-semibold">
        {lensType === "single" && "단초점"}
        {lensType === "progressive" && "누진다초점"}
        {lensType === "office" && "오피스 렌즈"}
      </div>
      {topRightBadge && (
        <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full bg-white/12 backdrop-blur-md text-white text-xs font-semibold border border-white/15">
          {topRightBadge}
        </div>
      )}

      {/* progressive vertical flow gutter */}
      {lensType === "progressive" && <ProgressiveFlow />}

      {/* sub-card stack */}
      <div
        className={cn(
          "absolute top-12 sm:top-16 bottom-9 sm:bottom-10 right-3 sm:right-5 flex flex-col gap-3 sm:gap-4",
          lensType === "progressive" ? "left-8 sm:left-8" : "left-3 sm:left-5"
        )}
      >
        {SCENES.map((s) => {
          const stat = status[s.id];
          const blur =
            stat.tone === "clear" ? 0 : stat.tone === "soft" ? 5 : 9;
          const opacity =
            stat.tone === "clear" ? 1 : stat.tone === "soft" ? 0.85 : 0.65;
          return (
            <div
              key={s.id}
              className="relative flex-1 rounded-2xl overflow-hidden ring-1 ring-white/10 bg-[#0B1426]/55 backdrop-blur-[2px] flex flex-col"
            >
              {/* header */}
              <div className="flex items-center justify-between gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-black/35 border-b border-white/5">
                <div className="flex items-center gap-1 sm:gap-1.5 text-white text-[11px] sm:text-[13px] font-bold tracking-tight min-w-0">
                  <span className="text-[12px] sm:text-[15px] leading-none shrink-0">
                    {s.emoji}
                  </span>
                  <span className="truncate">{s.label}</span>
                </div>
                <StatusChip tone={stat.tone} label={stat.label} />
              </div>

              {/* scene area */}
              <div className="relative flex-1 overflow-hidden">
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={false}
                  animate={{ filter: `blur(${blur}px)`, opacity }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <SceneBand id={s.id} />
                </motion.div>
                {stat.tone === "soft" && (
                  <div
                    aria-hidden
                    className="absolute inset-0 pointer-events-none bg-amber-300/15 mix-blend-screen"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur text-white/70 text-[10px] font-medium tracking-wide">
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
        : "bg-white/20 text-white";
  const icon = tone === "clear" ? "✓" : tone === "soft" ? "!" : "✕";
  return (
    <div
      className={cn(
        "shrink-0 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-bold tracking-tight shadow-soft whitespace-nowrap",
        styles
      )}
    >
      <span className="mr-0.5 sm:mr-1">{icon}</span>
      {label}
    </div>
  );
}

function ProgressiveFlow() {
  return (
    <div className="absolute left-3 sm:left-4 top-12 sm:top-16 bottom-9 sm:bottom-10 w-1 pointer-events-none flex flex-col items-center">
      <div className="w-0.5 flex-1 rounded-full bg-gradient-to-b from-brand via-purple-300 to-accent-mint opacity-70" />
      <div className="absolute -left-[3px] top-0 w-2.5 h-2.5 rounded-full bg-brand shadow-[0_0_12px_rgba(49,130,246,0.8)]" />
      <div className="absolute -left-[3px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-purple-300 shadow-[0_0_12px_rgba(196,181,253,0.8)]" />
      <div className="absolute -left-[3px] bottom-0 w-2.5 h-2.5 rounded-full bg-accent-mint shadow-[0_0_12px_rgba(0,200,150,0.8)]" />
    </div>
  );
}

function SceneBand({ id }: { id: SceneId }) {
  if (id === "far") {
    return (
      <SceneImage
        src="/scenes/driving.png"
        alt="운전 — 먼 거리 시야"
      />
    );
  }
  if (id === "mid") {
    return (
      <SceneImage
        src="/scenes/monitor.png"
        alt="모니터 화면 — 디지털 눈 피로 줄이기"
      />
    );
  }
  return (
    <SceneImage
      src="/scenes/book.png"
      alt="책 — 눈을 쉬게 하는 작은 습관들"
    />
  );
}

// Same image rendered twice: a blurred copy stretched to fill becomes the
// backdrop, the original sits on top with object-contain so nothing gets
// chopped. The card aspect ratio shifts as the page resizes — without the
// blurred underlay, contain would leave hard letterbox bands; without the
// contain layer on top, cover would crop the device edges off.
function SceneImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="w-full h-full relative overflow-hidden">
      <img
        src={src}
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-95"
      />
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-contain"
      />
    </div>
  );
}

