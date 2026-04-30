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
        <rect x="0" y="0" width="800" height="120" fill="url(#dr-sky)" />
        <ellipse cx="400" cy="118" rx="520" ry="22" fill="#83A5D8" opacity="0.45" />
        <path
          d="M0,118 L40,118 L48,108 L82,108 L92,114 L138,114 L150,100 L188,100 L200,110 L246,110 L254,118 L800,118 L800,120 L0,120 Z"
          fill="#0A1628"
          opacity="0.9"
        />
        <polygon points="20,118 6,160 34,160" fill="#08182E" />
        <polygon points="60,108 44,158 76,158" fill="#0E2238" />
        <polygon points="780,108 766,158 794,158" fill="#08182E" />
        <polygon points="730,118 720,160 740,160" fill="#0E2238" />
        <polygon points="0,200 800,200 528,118 272,118" fill="url(#dr-road)" />
        <line x1="272" y1="118" x2="0" y2="200" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.5" />
        <line x1="528" y1="118" x2="800" y2="200" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.5" />
        <rect x="397" y="124" width="6" height="4" rx="0.5" fill="#FFD24A" />
        <rect x="395" y="134" width="10" height="6" rx="1" fill="#FFD24A" />
        <rect x="392" y="148" width="16" height="10" rx="1" fill="#FFD24A" />
        <rect x="388" y="166" width="22" height="14" rx="1.5" fill="#FFD24A" />
        <rect x="383" y="186" width="32" height="14" rx="2" fill="#FFD24A" />
        <rect x="346" y="110" width="108" height="34" rx="6" fill="#1B1B1B" />
        <rect x="349" y="113" width="102" height="13" rx="2" fill="#0E0E0E" />
        <rect x="354" y="129" width="14" height="6" rx="1.5" fill="#FF2A2A" />
        <rect x="432" y="129" width="14" height="6" rx="1.5" fill="#FF2A2A" />
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
        <path d="M0,200 Q400,182 800,200 L800,202 L0,202 Z" fill="#070707" opacity="0.85" />
      </svg>
    </div>
  );
}

// Front-on flat illustration of a monitor whose screen is itself an
// eye-health webpage — so the *content* the lens type compares against
// is teaching the user something. SVG instead of a raster so the
// Korean text renders crisply at any card size.
function MonitorScene() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-[#1F2A45] via-[#172238] to-[#0E1726]">
      <svg
        viewBox="0 0 800 500"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <linearGradient id="ms-screen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FAFCFF" />
            <stop offset="1" stopColor="#E9EFF8" />
          </linearGradient>
          <linearGradient id="ms-bezel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1A2030" />
            <stop offset="0.06" stopColor="#0E1422" />
            <stop offset="1" stopColor="#06080F" />
          </linearGradient>
          <linearGradient id="ms-stand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1A2236" />
            <stop offset="1" stopColor="#080C16" />
          </linearGradient>
        </defs>

        {/* desk surface */}
        <rect x="0" y="438" width="800" height="62" fill="#1F2A40" />
        <rect x="0" y="434" width="800" height="6" fill="#34405A" />

        {/* monitor cast shadow on desk */}
        <ellipse
          cx="400"
          cy="438"
          rx="200"
          ry="6"
          fill="#000000"
          opacity="0.55"
        />

        {/* stand: trapezoidal base + curved neck for depth */}
        <path d="M 318 432 L 482 432 L 470 422 L 330 422 Z" fill="url(#ms-stand)" />
        <rect x="316" y="430" width="168" height="4" rx="1.5" fill="#06080F" />
        <path
          d="M 386 408 Q 386 402 390 400 L 410 400 Q 414 402 414 408 L 414 422 L 386 422 Z"
          fill="url(#ms-stand)"
        />

        {/* monitor body — thicker outer bezel + soft top highlight */}
        <rect
          x="72"
          y="48"
          width="656"
          height="366"
          rx="16"
          fill="url(#ms-bezel)"
        />
        <rect x="78" y="50" width="644" height="1.5" fill="#FFFFFF" opacity="0.18" />
        <rect x="78" y="52.5" width="644" height="0.5" fill="#FFFFFF" opacity="0.07" />

        {/* inner bezel ring */}
        <rect
          x="86"
          y="62"
          width="628"
          height="338"
          rx="6"
          fill="#06080F"
        />

        {/* screen */}
        <rect x="98" y="74" width="604" height="314" rx="5" fill="url(#ms-screen)" />

        {/* screen inner top shadow for slight inset feel */}
        <rect x="98" y="74" width="604" height="3" fill="#1A2030" opacity="0.4" />

        {/* bottom-bezel brand mark + power LED */}
        <text
          x="400"
          y="408"
          textAnchor="middle"
          fontSize="6"
          fontWeight="800"
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
          fill="#1F2A40"
          letterSpacing="2"
        >
          VISTA
        </text>
        <circle cx="700" cy="406" r="2.2" fill="#3182F6" opacity="0.9" />
        <circle cx="700" cy="406" r="4" fill="#3182F6" opacity="0.25" />

        {/* browser top bar */}
        <rect x="98" y="74" width="604" height="32" fill="#E1E7F0" />
        <circle cx="118" cy="90" r="4" fill="#FF5F57" />
        <circle cx="132" cy="90" r="4" fill="#FFBD2E" />
        <circle cx="146" cy="90" r="4" fill="#28CA42" />
        <rect x="170" y="82" width="500" height="16" rx="3" fill="#F4F6FA" />
        <text
          x="184"
          y="94"
          fontSize="10"
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
          fill="#6B7280"
        >
          eyehealth.guide / digital-strain
        </text>

        {/* page heading */}
        <text
          x="158"
          y="148"
          fontSize="22"
          fontWeight="800"
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
          fill="#1A2A4A"
          letterSpacing="-0.5"
        >
          디지털 눈 피로 줄이기
        </text>
        <text
          x="158"
          y="168"
          fontSize="11"
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
          fill="#6B7280"
        >
          건강 칼럼 · 눈 건강 가이드
        </text>

        {/* hero stat card */}
        <rect
          x="158"
          y="186"
          width="200"
          height="120"
          rx="8"
          fill="#EEF3FB"
          stroke="#D5DDE8"
          strokeWidth="1"
        />
        <text
          x="258"
          y="234"
          textAnchor="middle"
          fontSize="34"
          fontWeight="800"
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
          fill="#3182F6"
          letterSpacing="-1"
        >
          20-20-20
        </text>
        <text
          x="258"
          y="258"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
          fill="#1A2A4A"
        >
          규칙
        </text>
        <text
          x="258"
          y="280"
          textAnchor="middle"
          fontSize="9"
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
          fill="#4A5568"
        >
          20분 작업 → 6m 거리
        </text>
        <text
          x="258"
          y="293"
          textAnchor="middle"
          fontSize="9"
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
          fill="#4A5568"
        >
          → 20초 응시
        </text>

        {/* side article */}
        <text
          x="378"
          y="208"
          fontSize="13"
          fontWeight="700"
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
          fill="#1A2A4A"
        >
          왜 중요한가요?
        </text>
        <rect x="378" y="220" width="294" height="5" rx="1.5" fill="#D5DDE8" />
        <rect x="378" y="232" width="280" height="5" rx="1.5" fill="#D5DDE8" />
        <rect x="378" y="244" width="288" height="5" rx="1.5" fill="#D5DDE8" />
        <rect x="378" y="256" width="240" height="5" rx="1.5" fill="#D5DDE8" />

        <text
          x="378"
          y="288"
          fontSize="11"
          fontWeight="700"
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
          fill="#1A2A4A"
        >
          화면까지 50~70cm 유지
        </text>
        <rect x="378" y="298" width="270" height="5" rx="1.5" fill="#D5DDE8" />

        {/* footer body */}
        <rect x="158" y="332" width="514" height="5" rx="1.5" fill="#D5DDE8" />
        <rect x="158" y="344" width="494" height="5" rx="1.5" fill="#D5DDE8" />
        <rect x="158" y="356" width="380" height="5" rx="1.5" fill="#D5DDE8" />
      </svg>
    </div>
  );
}

// Open book viewed straight on with an eye-health column on the
// pages — same intent as the monitor scene but for near vision.
function BookScene() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-[#3A2E1F] via-[#2D2317] to-[#1A130A]">
      <svg
        viewBox="0 0 800 500"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <linearGradient id="bk-page" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFFCF1" />
            <stop offset="1" stopColor="#F4EBD3" />
          </linearGradient>
          <linearGradient id="bk-spine" x1="0" y1="0.5" x2="1" y2="0.5">
            <stop offset="0" stopColor="#C9B89A" stopOpacity="0" />
            <stop offset="0.5" stopColor="#3A2A12" stopOpacity="0.7" />
            <stop offset="1" stopColor="#C9B89A" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="bk-cover" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7A4F2A" />
            <stop offset="0.5" stopColor="#5C3A1E" />
            <stop offset="1" stopColor="#3F2614" />
          </linearGradient>
        </defs>

        {/* heavy table shadow under the book */}
        <ellipse cx="400" cy="462" rx="380" ry="20" fill="#0A0500" opacity="0.75" />
        <ellipse cx="400" cy="458" rx="350" ry="10" fill="#0A0500" opacity="0.45" />

        {/* hardback cover — sticks out a few px beyond the page block
            on every side so the binding reads as a real hardcover */}
        <rect x="56" y="74" width="688" height="368" rx="3" fill="url(#bk-cover)" />
        {/* gold stamp/border line on cover */}
        <rect
          x="62"
          y="80"
          width="676"
          height="356"
          rx="2"
          fill="none"
          stroke="#A07A48"
          strokeWidth="0.8"
          opacity="0.55"
        />
        {/* subtle leather-like top sheen */}
        <rect x="58" y="76" width="684" height="2" fill="#9A6638" opacity="0.6" />

        {/* page block — the stack of pages, edges visible all around the
            cover inset. Cream tone with thin gold gilt edges. */}
        <rect x="74" y="84" width="652" height="350" fill="#EDE0BE" />
        {/* gilt edges */}
        <rect x="74" y="84" width="652" height="2" fill="#D4BC82" />
        <rect x="74" y="432" width="652" height="2" fill="#A8946F" />
        <rect x="74" y="84" width="2" height="350" fill="#D4BC82" />
        <rect x="724" y="84" width="2" height="350" fill="#D4BC82" />
        {/* faint horizontal lines suggesting individual pages on the edge */}
        <g opacity="0.18">
          {[88, 92, 96, 420, 424, 428].map((y) => (
            <line key={y} x1="76" y1={y} x2="724" y2={y} stroke="#8A6A3A" strokeWidth="0.4" />
          ))}
        </g>

        {/* page surface — the spread we actually read */}
        <rect x="80" y="88" width="640" height="342" fill="url(#bk-page)" />

        {/* spine valley — deeper shadow + crease */}
        <rect x="388" y="88" width="24" height="342" fill="url(#bk-spine)" />
        <line
          x1="400"
          y1="88"
          x2="400"
          y2="430"
          stroke="#7A5A30"
          strokeWidth="1.4"
          opacity="0.55"
        />
        <line
          x1="400"
          y1="88"
          x2="400"
          y2="430"
          stroke="#3A2A12"
          strokeWidth="0.5"
          opacity="0.7"
        />

        {/* LEFT PAGE */}
        <text
          x="120"
          y="125"
          fontSize="9"
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
          fontWeight="700"
          fill="#8A7857"
          letterSpacing="1.5"
        >
          CHAPTER 03
        </text>
        <text
          x="120"
          y="160"
          fontSize="22"
          fontWeight="800"
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
          fill="#2D2417"
          letterSpacing="-0.5"
        >
          눈을 쉬게 하는
        </text>
        <text
          x="120"
          y="186"
          fontSize="22"
          fontWeight="800"
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
          fill="#2D2417"
          letterSpacing="-0.5"
        >
          작은 습관들
        </text>
        <rect x="120" y="200" width="40" height="2" fill="#8A7857" />

        <rect x="120" y="222" width="245" height="5" rx="1.5" fill="#9B8A6A" />
        <rect x="120" y="237" width="255" height="5" rx="1.5" fill="#9B8A6A" />
        <rect x="120" y="252" width="220" height="5" rx="1.5" fill="#9B8A6A" />
        <rect x="120" y="267" width="240" height="5" rx="1.5" fill="#9B8A6A" />

        <text
          x="120"
          y="300"
          fontSize="11"
          fontWeight="700"
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
          fill="#2D2417"
        >
          • 자주 깜빡이기
        </text>
        <text
          x="120"
          y="318"
          fontSize="11"
          fontWeight="700"
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
          fill="#2D2417"
        >
          • 30~40cm 독서 거리
        </text>
        <text
          x="120"
          y="336"
          fontSize="11"
          fontWeight="700"
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
          fill="#2D2417"
        >
          • 30분마다 짧은 휴식
        </text>

        <rect x="120" y="358" width="245" height="5" rx="1.5" fill="#9B8A6A" />
        <rect x="120" y="373" width="200" height="5" rx="1.5" fill="#9B8A6A" />

        {/* RIGHT PAGE */}
        <text
          x="430"
          y="125"
          fontSize="14"
          fontWeight="800"
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
          fill="#2D2417"
        >
          조명과 눈
        </text>
        <rect x="430" y="135" width="30" height="2" fill="#8A7857" />

        <rect x="430" y="156" width="240" height="5" rx="1.5" fill="#9B8A6A" />
        <rect x="430" y="171" width="255" height="5" rx="1.5" fill="#9B8A6A" />
        <rect x="430" y="186" width="220" height="5" rx="1.5" fill="#9B8A6A" />
        <rect x="430" y="201" width="245" height="5" rx="1.5" fill="#9B8A6A" />
        <rect x="430" y="216" width="180" height="5" rx="1.5" fill="#9B8A6A" />

        {/* small diagram — desk lamp + book */}
        <rect
          x="450"
          y="248"
          width="170"
          height="86"
          rx="4"
          fill="#F7EFD8"
          stroke="#C9B89A"
          strokeWidth="1.2"
        />
        {/* lamp */}
        <line x1="540" y1="256" x2="540" y2="296" stroke="#7A6850" strokeWidth="2.4" />
        <path
          d="M 524 256 L 556 256 L 549 274 L 531 274 Z"
          fill="#7A6850"
        />
        <line
          x1="540"
          y1="276"
          x2="492"
          y2="320"
          stroke="#FFE7A8"
          strokeWidth="1.2"
          strokeDasharray="2 2"
          opacity="0.85"
        />
        <line
          x1="540"
          y1="276"
          x2="588"
          y2="320"
          stroke="#FFE7A8"
          strokeWidth="1.2"
          strokeDasharray="2 2"
          opacity="0.85"
        />
        {/* small book on desk */}
        <rect x="510" y="312" width="60" height="10" rx="1.5" fill="#A8946F" />
        <line x1="540" y1="312" x2="540" y2="322" stroke="#7A6850" strokeWidth="0.8" />
        <text
          x="535"
          y="354"
          textAnchor="middle"
          fontSize="9"
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
          fontWeight="700"
          fill="#7A6850"
        >
          300 lux 이상이 적당
        </text>

        <rect x="430" y="370" width="240" height="5" rx="1.5" fill="#9B8A6A" />
        <rect x="430" y="385" width="210" height="5" rx="1.5" fill="#9B8A6A" />

        {/* page numbers */}
        <text
          x="120"
          y="414"
          fontSize="9"
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
          fill="#8A7857"
        >
          — 23 —
        </text>
        <text
          x="680"
          y="414"
          textAnchor="end"
          fontSize="9"
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
          fill="#8A7857"
        >
          — 24 —
        </text>
      </svg>
    </div>
  );
}
