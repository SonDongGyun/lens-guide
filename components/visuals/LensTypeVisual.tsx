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
            <SceneLabel id={s.id} />
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
        : "bg-white/20 text-white";
  const icon = tone === "clear" ? "✓" : tone === "soft" ? "!" : "✕";
  return (
    <div
      className={`absolute right-3 bottom-3 px-3 py-1.5 rounded-full text-[13px] font-bold tracking-tight backdrop-blur shadow-soft ${styles}`}
    >
      <span className="mr-1">{icon}</span>
      {label}
    </div>
  );
}

const SCENE_LABELS: Record<SceneId, { emoji: string; label: string }> = {
  far: { emoji: "🚗", label: "운전" },
  mid: { emoji: "💻", label: "모니터" },
  near: { emoji: "📖", label: "책" },
};

function SceneLabel({ id }: { id: SceneId }) {
  const { emoji, label } = SCENE_LABELS[id];
  return (
    <div className="absolute left-3 bottom-3 px-2.5 py-1.5 rounded-full bg-black/55 backdrop-blur text-white text-[13px] font-bold tracking-tight flex items-center gap-1.5 shadow-soft">
      <span className="text-[14px] leading-none">{emoji}</span>
      <span>{label}</span>
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
  if (id === "far") return <DrivingScene />;
  if (id === "mid") return <MonitorScene />;
  return <BookScene />;
}

function DrivingScene() {
  return (
    <div className="w-full h-full relative">
      <svg
        viewBox="0 0 800 200"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <linearGradient id="dr-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0F1F3D" />
            <stop offset="0.55" stopColor="#1F4685" />
            <stop offset="1" stopColor="#5680B8" />
          </linearGradient>
          <linearGradient id="dr-road" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2A2A2A" />
            <stop offset="1" stopColor="#0E0E0E" />
          </linearGradient>
        </defs>
        {/* sky */}
        <rect x="0" y="0" width="800" height="120" fill="url(#dr-sky)" />
        {/* horizon glow */}
        <ellipse cx="400" cy="118" rx="520" ry="22" fill="#83A5D8" opacity="0.45" />
        {/* distant city silhouette */}
        <path
          d="M0,118 L40,118 L48,108 L82,108 L92,114 L138,114 L150,100 L188,100 L200,110 L246,110 L254,118 L800,118 L800,120 L0,120 Z"
          fill="#0A1628"
          opacity="0.9"
        />
        {/* trees */}
        <polygon points="20,118 6,160 34,160" fill="#08182E" />
        <polygon points="60,108 44,158 76,158" fill="#0E2238" />
        <polygon points="780,108 766,158 794,158" fill="#08182E" />
        <polygon points="730,118 720,160 740,160" fill="#0E2238" />
        {/* road */}
        <polygon points="0,200 800,200 528,118 272,118" fill="url(#dr-road)" />
        {/* shoulder lines (perspective) */}
        <line x1="272" y1="118" x2="0" y2="200" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.5" />
        <line x1="528" y1="118" x2="800" y2="200" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.5" />
        {/* center lane markings */}
        <rect x="397" y="124" width="6" height="4" rx="0.5" fill="#FFD24A" />
        <rect x="395" y="134" width="10" height="6" rx="1" fill="#FFD24A" />
        <rect x="392" y="148" width="16" height="10" rx="1" fill="#FFD24A" />
        <rect x="388" y="166" width="22" height="14" rx="1.5" fill="#FFD24A" />
        <rect x="383" y="186" width="32" height="14" rx="2" fill="#FFD24A" />
        {/* car ahead */}
        <rect x="346" y="110" width="108" height="34" rx="6" fill="#1B1B1B" />
        <rect x="349" y="113" width="102" height="13" rx="2" fill="#0E0E0E" />
        {/* tail lights */}
        <rect x="354" y="129" width="14" height="6" rx="1.5" fill="#FF2A2A" />
        <rect x="432" y="129" width="14" height="6" rx="1.5" fill="#FF2A2A" />
        {/* license plate */}
        <rect x="378" y="131" width="44" height="11" rx="1" fill="#F2F2F2" />
        <text
          x="400"
          y="139.5"
          textAnchor="middle"
          fontSize="7.5"
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
          fontWeight="800"
          fill="#1A1A1A"
          letterSpacing="-0.3"
        >
          12가 3456
        </text>
        {/* road sign */}
        <rect x="582" y="58" width="148" height="68" rx="4" fill="#0E5E3D" stroke="#FFFFFF" strokeWidth="2" />
        <text
          x="656"
          y="88"
          textAnchor="middle"
          fontSize="22"
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
          fontWeight="800"
          fill="#FFFFFF"
        >
          서울
        </text>
        <text
          x="656"
          y="114"
          textAnchor="middle"
          fontSize="14"
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
          fontWeight="600"
          fill="#FFFFFF"
        >
          5 km
        </text>
        <rect x="652" y="126" width="8" height="24" fill="#6B6B6B" />
        {/* dashboard hint */}
        <path d="M0,200 Q400,182 800,200 L800,202 L0,202 Z" fill="#070707" opacity="0.85" />
      </svg>
    </div>
  );
}

function MonitorScene() {
  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <div className="relative w-[72%] h-[88%]">
        {/* monitor frame */}
        <div className="absolute inset-0 rounded-[10px] bg-gradient-to-b from-[#2C2C2C] to-[#141414] p-[3px] shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
          {/* screen */}
          <div className="relative w-full h-full rounded-[7px] bg-gradient-to-br from-[#FBFBFB] to-[#E5E7EB] overflow-hidden">
            {/* window chrome */}
            <div className="flex items-center gap-1 px-2 py-1 bg-[#E1E2E6] border-b border-black/5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF5F57]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#FEBC2E]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#28C840]" />
              <div className="ml-2 flex-1 h-1.5 bg-white/85 rounded-sm" />
              <div className="w-3 h-1.5 bg-white/60 rounded-sm" />
            </div>
            {/* document body */}
            <div className="px-3 pt-2 pb-1">
              {/* heading */}
              <div className="h-[9px] w-[44%] bg-ink-900/90 rounded-sm" />
              <div className="h-[3px] w-[30%] bg-ink-900/40 rounded-sm mt-1" />
              {/* paragraph 1 */}
              <div className="space-y-[3px] mt-2.5">
                {[92, 88, 90, 86, 64].map((w, i) => (
                  <div
                    key={i}
                    className="h-[2.5px] bg-ink-900/65 rounded"
                    style={{ width: `${w}%` }}
                  />
                ))}
              </div>
              {/* table */}
              <div className="mt-2.5 grid grid-cols-4 gap-px bg-ink-900/20 p-px rounded-sm">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="h-[8px] bg-white">
                    <div
                      className="h-[2.5px] mx-1 mt-[1.5px] bg-ink-900/60 rounded"
                      style={{ width: `${50 + ((i * 17) % 40)}%` }}
                    />
                  </div>
                ))}
              </div>
              {/* paragraph 2 */}
              <div className="space-y-[3px] mt-2.5">
                {[88, 80, 56].map((w, i) => (
                  <div
                    key={i}
                    className="h-[2.5px] bg-ink-900/65 rounded"
                    style={{ width: `${w}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* monitor stand */}
        <div className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-[32%] h-[4px] bg-gradient-to-b from-[#1F1F1F] to-[#0A0A0A] rounded-b-[2px]" />
        <div className="absolute -bottom-[8px] left-1/2 -translate-x-1/2 w-[40%] h-[2px] bg-[#0A0A0A] rounded-full" />
      </div>
    </div>
  );
}

function BookScene() {
  const leftLines = [88, 92, 86, 90, 75, 88, 0, 82, 90, 86, 72];
  const rightLines = [88, 90, 86, 92, 75, 90, 84, 80, 0, 88, 76, 90, 64];
  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <div
        className="relative w-[78%] h-[88%] flex shadow-[0_10px_32px_rgba(0,0,0,0.45)] rounded-[3px] overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, #FBF6E8 0%, #F1EAD3 50%, #E8DEC0 100%)",
        }}
      >
        {/* left page */}
        <div className="relative flex-1 px-4 pt-3 pb-4">
          {/* chapter heading */}
          <div className="h-[10px] w-[55%] bg-ink-900/90 rounded-sm" />
          <div className="h-[3px] w-[38%] bg-ink-900/45 rounded-sm mt-1" />
          <div className="space-y-[4px] mt-3">
            {leftLines.map((w, i) =>
              w === 0 ? (
                <div key={i} className="h-1.5" />
              ) : (
                <div
                  key={i}
                  className="h-[2.5px] bg-ink-900/65 rounded"
                  style={{ width: `${w}%` }}
                />
              )
            )}
          </div>
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[10px] font-serif text-ink-900/55 tracking-wider">
            42
          </div>
        </div>
        {/* binding shadow */}
        <div
          className="w-[3px]"
          style={{
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.28) 50%, rgba(0,0,0,0.05) 100%)",
          }}
        />
        {/* right page */}
        <div className="relative flex-1 px-4 pt-3 pb-4">
          <div className="space-y-[4px]">
            {rightLines.map((w, i) =>
              w === 0 ? (
                <div key={i} className="h-1.5" />
              ) : (
                <div
                  key={i}
                  className="h-[2.5px] bg-ink-900/65 rounded"
                  style={{ width: `${w}%` }}
                />
              )
            )}
          </div>
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[10px] font-serif text-ink-900/55 tracking-wider">
            43
          </div>
        </div>
      </div>
    </div>
  );
}
