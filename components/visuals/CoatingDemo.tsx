"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState, type ReactNode } from "react";
import type { CoatingId } from "@/lib/data";

interface Props {
  id: CoatingId;
}

type CompareCoatingId = Exclude<CoatingId, "scratch">;
type EffectProps = { after: boolean };

const COMPARE_LABELS: Record<
  CompareCoatingId,
  { left: string; right: string; disclaimer: string }
> = {
  ar: {
    left: "코팅 없음",
    right: "코팅 적용",
    disclaimer: "* 개념 시뮬레이션 — 실제 환경의 차이는 매장에서 확인됩니다",
  },
  blue: {
    left: "일반 시야",
    right: "디지털 환경용 비교",
    disclaimer: "* 청색광의 일부를 거르며, 차단량은 제품별로 다릅니다",
  },
  photochromic: {
    left: "코팅 없음",
    right: "코팅 적용",
    disclaimer: "* 개념 시뮬레이션 — 실제 환경의 차이는 매장에서 확인됩니다",
  },
  hydrophobic: {
    left: "코팅 없음",
    right: "코팅 적용",
    disclaimer: "* 개념 시뮬레이션 — 실제 환경의 차이는 매장에서 확인됩니다",
  },
};

// Drop a static-imported image here per coating to swap the SVG/CSS
// background for a real photo or render. SceneBackground will pick it
// up automatically; the effect layer above stays untouched.
const BACKGROUND_ASSETS: Partial<Record<CompareCoatingId, string>> = {};

export function CoatingDemo({ id }: Props) {
  if (id === "scratch") return <ScratchExplainer />;
  return <CompareView id={id} />;
}

function CompareView({ id }: { id: CompareCoatingId }) {
  const [split, setSplit] = useState(50);
  const labels = COMPARE_LABELS[id];

  return (
    <div className="relative w-full aspect-[16/10] rounded-3xl overflow-hidden border border-ink-50 shadow-card select-none">
      <SceneCompose id={id} after />

      <div
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${split}%` }}
      >
        <div className="relative w-screen max-w-none h-full">
          <SceneCompose id={id} after={false} />
        </div>
      </div>

      <motion.div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-elevated cursor-ew-resize z-20"
        style={{ left: `calc(${split}% - 2px)` }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0}
        onDrag={(_, info) => {
          const el = document.querySelector("[data-compare-root]");
          if (!el) return;
          const rect = (el as HTMLElement).getBoundingClientRect();
          const next = ((info.point.x - rect.left) / rect.width) * 100;
          setSplit(Math.max(5, Math.min(95, next)));
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-elevated grid place-items-center">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path
              d="M8 6l-4 5 4 5M14 6l4 5-4 5"
              stroke="#191F28"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </motion.div>

      <input
        aria-label="Coating compare slider"
        type="range"
        min={5}
        max={95}
        value={split}
        onChange={(e) => setSplit(Number(e.target.value))}
        className="absolute bottom-3 left-1/2 -translate-x-1/2 w-1/2 accent-brand opacity-0"
      />

      <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur text-white text-xs font-bold tracking-wider uppercase">
        {labels.left}
      </div>
      <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full bg-brand text-white text-xs font-bold tracking-wider uppercase shadow-md">
        {labels.right}
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 max-w-[92%] px-2.5 py-1 rounded-full bg-black/40 backdrop-blur text-white/80 text-[10px] font-medium tracking-wide text-center">
        {labels.disclaimer}
      </div>

      <div data-compare-root className="absolute inset-0 pointer-events-none" />
    </div>
  );
}

// Scenes are split into a Background (the world / object) and an
// Effect (the state-dependent coating visualization). Future photo
// or render assets replace Background; Effect stays as code.
function SceneCompose({ id, after }: { id: CompareCoatingId; after: boolean }) {
  return (
    <>
      <SceneBackground id={id} asset={BACKGROUND_ASSETS[id]} />
      <SceneEffect id={id} after={after} />
    </>
  );
}

function SceneBackground({
  id,
  asset,
}: {
  id: CompareCoatingId;
  asset?: string;
}) {
  if (asset) {
    return (
      <div className="absolute inset-0">
        <Image
          src={asset}
          alt=""
          fill
          priority
          sizes="(min-width:1024px) 60vw, 100vw"
          className="object-cover"
        />
      </div>
    );
  }
  if (id === "ar") return <ARBackground />;
  if (id === "blue") return <BlueBackground />;
  if (id === "photochromic") return <PhotochromicBackground />;
  return <HydroBackground />;
}

function SceneEffect({
  id,
  after,
}: {
  id: CompareCoatingId;
  after: boolean;
}) {
  if (id === "ar") return <AREffect after={after} />;
  if (id === "blue") return <BlueEffect after={after} />;
  if (id === "photochromic") return <PhotochromicEffect after={after} />;
  return <HydroEffect after={after} />;
}

/* =============================== AR =============================== */

const AR_LIGHTS = [
  { cx: 358, cy: 308, r: 7, halo: 56, ray: false },
  { cx: 442, cy: 308, r: 7, halo: 56, ray: false },
  { cx: 314, cy: 348, r: 11, halo: 105, ray: true },
  { cx: 486, cy: 348, r: 11, halo: 105, ray: true },
  { cx: 70, cy: 215, r: 6, halo: 42, ray: false },
  { cx: 730, cy: 215, r: 6, halo: 42, ray: false },
  { cx: 200, cy: 198, r: 5, halo: 28, ray: false },
  { cx: 600, cy: 198, r: 5, halo: 28, ray: false },
];

function ARBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #050A1A 0%, #0A1224 32%, #131A36 58%, #1F2348 76%, #2A2440 88%, #36262E 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0"
        style={{
          top: "44%",
          height: "16%",
          background:
            "linear-gradient(180deg, rgba(220,140,80,0.16) 0%, rgba(140,80,60,0.10) 50%, transparent 100%)",
          filter: "blur(10px)",
        }}
      />

      <svg
        viewBox="0 0 800 500"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
      >
        <polygon
          points="0,260 60,250 90,232 130,242 170,238 210,225 240,235 280,228 320,240 360,250 0,260"
          fill="#04080F"
          opacity="0.95"
        />
        <polygon
          points="800,260 740,250 710,232 670,242 630,238 590,225 560,235 520,228 480,240 440,250 800,260"
          fill="#04080F"
          opacity="0.95"
        />
        {[
          [80, 247],
          [108, 245],
          [148, 248],
          [185, 244],
          [220, 247],
          [252, 245],
          [298, 248],
          [328, 244],
          [355, 246],
          [478, 246],
          [512, 244],
          [560, 248],
          [598, 245],
          [638, 247],
          [688, 244],
          [728, 246],
        ].map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="0.9"
            fill="#FFE4A0"
            opacity={0.45 + (i % 3) * 0.18}
          />
        ))}

        <polygon points="350,500 450,500 555,260 245,260" fill="#080C18" />
        <defs>
          <linearGradient id="ar-asphalt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0A1020" stopOpacity="0" />
            <stop offset="100%" stopColor="#15182A" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <polygon
          points="350,500 450,500 555,260 245,260"
          fill="url(#ar-asphalt)"
        />

        <rect x="397" y="278" width="6" height="9" fill="#FBBF24" opacity="0.42" />
        <rect x="395.5" y="298" width="9" height="14" fill="#FBBF24" opacity="0.62" />
        <rect x="394" y="322" width="12" height="18" fill="#FBBF24" opacity="0.78" />
        <rect x="392" y="352" width="16" height="22" fill="#FBBF24" opacity="0.92" />
        <rect x="390" y="386" width="20" height="26" fill="#FBBF24" />
      </svg>

      {AR_LIGHTS.map((l, i) => (
        <div
          key={`core-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${(l.cx / 800) * 100}%`,
            top: `${(l.cy / 500) * 100}%`,
            width: l.r * 2,
            height: l.r * 2,
            transform: "translate(-50%,-50%)",
            background:
              "radial-gradient(circle, #FFFCEC 0%, #FFF6CC 65%, #FFEDA0 100%)",
            boxShadow: "0 0 6px rgba(255,250,210,0.55)",
          }}
        />
      ))}
    </div>
  );
}

function AREffect({ after }: EffectProps) {
  return (
    <>
      {!after &&
        AR_LIGHTS.map((l, i) => (
          <div
            key={`halo-${i}`}
            className="absolute pointer-events-none"
            style={{
              left: `${(l.cx / 800) * 100}%`,
              top: `${(l.cy / 500) * 100}%`,
              width: l.halo * 2.4,
              height: l.halo * 2.4,
              transform: "translate(-50%,-50%)",
            }}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,235,170,0.42) 0%, rgba(255,225,140,0.16) 32%, transparent 65%)",
                filter: "blur(10px)",
                mixBlendMode: "screen",
              }}
            />
            <div
              className="absolute inset-[18%] rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,250,210,0.85) 0%, rgba(255,240,170,0.45) 30%, transparent 65%)",
                filter: "blur(2.5px)",
                mixBlendMode: "screen",
              }}
            />
          </div>
        ))}

      {!after && (
        <svg
          viewBox="0 0 800 500"
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
        >
          {AR_LIGHTS.filter((l) => l.ray).flatMap((l, i) =>
            [0, 30, 60, 90, 120, 150].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              const len = l.halo * 1.45 * (0.85 + ((i + deg) % 5) * 0.06);
              const opacity = deg % 60 === 0 ? 0.34 : 0.2;
              return (
                <line
                  key={`r-${i}-${deg}`}
                  x1={l.cx - Math.cos(rad) * len}
                  y1={l.cy - Math.sin(rad) * len}
                  x2={l.cx + Math.cos(rad) * len}
                  y2={l.cy + Math.sin(rad) * len}
                  stroke={`rgba(255,240,170,${opacity})`}
                  strokeWidth={deg % 60 === 0 ? 1.7 : 1.1}
                  strokeLinecap="round"
                />
              );
            })
          )}
        </svg>
      )}

      {/* Ghost reflection: the dashboard / interior bouncing back off the
          uncoated lens. Multiple layered bands suggest chromatic spread. */}
      {!after && (
        <>
          <div
            aria-hidden
            className="absolute inset-x-0 top-[14%] h-[24%] pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 50% 100% at 65% 50%, rgba(255,225,170,0.32), transparent 70%), radial-gradient(ellipse 60% 100% at 28% 60%, rgba(180,210,255,0.26), transparent 70%)",
              filter: "blur(12px)",
              mixBlendMode: "screen",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-x-0 top-[40%] h-[16%] pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 35% 100% at 50% 50%, rgba(255,220,180,0.18), transparent 75%)",
              filter: "blur(8px)",
              mixBlendMode: "screen",
            }}
          />
        </>
      )}

      {/* AR coating's faint violet/green periphery sheen — the visual
          signature that tells you a lens has AR coating in real photos. */}
      {after && (
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 110% 75% at 50% 50%, transparent 60%, rgba(140,110,255,0.12) 80%, rgba(110,200,150,0.13) 100%)",
          }}
        />
      )}
    </>
  );
}

/* =============================== BLUE LIGHT =============================== */

function BlueBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-[#080F1C] via-[#0A1426] to-[#0F1A30]">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 55% at 50% 55%, rgba(80,130,220,0.20), transparent 70%)",
        }}
      />

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[64%] h-[72%] rounded-xl bg-[#0E1322] p-[5px] shadow-[0_0_60px_rgba(80,140,255,0.45)]">
        <div
          className="relative w-full h-full rounded-md overflow-hidden"
          style={{
            background:
              "linear-gradient(155deg, #1B335E 0%, #14264E 60%, #102046 100%)",
          }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-[20%] bg-[#0F1F40]/85" />
          <div className="absolute left-0 top-0 bottom-0 w-[20%]">
            <div className="px-2 pt-3 flex flex-col gap-1.5">
              {[68, 50, 56, 44, 60, 38, 52, 46].map((w, i) => (
                <div
                  key={i}
                  className="h-1.5 rounded-sm"
                  style={{
                    width: `${w}%`,
                    background:
                      i === 2 ? "rgba(255,255,255,0.42)" : "rgba(255,255,255,0.18)",
                  }}
                />
              ))}
            </div>
          </div>

          <div className="absolute right-3 left-[24%] top-3 flex flex-col gap-[5px]">
            <CodeRow tokens={[[8, "violet"], [18, "cyan"], [5, "white"], [22, "amber"]]} />
            <CodeRow indent={6} tokens={[[10, "blue"], [3, "white"], [30, "emerald"]]} />
            <CodeRow indent={6} tokens={[[12, "cyan"], [3, "white"], [22, "pink"], [5, "white"]]} />
            <CodeRow indent={12} tokens={[[8, "blue"], [26, "emerald"]]} />
            <div className="h-1.5" />
            <CodeRow tokens={[[10, "violet"], [14, "amber"], [18, "white"]]} />
            <CodeRow indent={6} tokens={[[8, "blue"], [4, "white"], [24, "emerald"]]} />
            <CodeRow indent={12} tokens={[[10, "cyan"], [3, "white"], [16, "pink"]]} />
            <CodeRow indent={12} tokens={[[6, "blue"], [30, "white"]]} />
            <CodeRow indent={6} tokens={[[12, "violet"]]} />
          </div>

          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 32%, transparent 68%, rgba(255,255,255,0.04) 100%)",
            }}
          />
        </div>
      </div>

      <div
        aria-hidden
        className="absolute left-1/2 top-[88.5%] -translate-x-1/2 w-[7%] h-[3%] bg-[#0E1322]"
      />
      <div
        aria-hidden
        className="absolute left-1/2 top-[91.5%] -translate-x-1/2 w-[18%] h-[1.6%] rounded-sm bg-[#0E1322]"
      />
    </div>
  );
}

const TOKEN_COLOR: Record<string, string> = {
  violet: "rgba(196,170,255,0.65)",
  cyan: "rgba(170,235,255,0.65)",
  blue: "rgba(150,190,255,0.65)",
  amber: "rgba(255,215,150,0.62)",
  emerald: "rgba(160,235,200,0.6)",
  pink: "rgba(255,180,210,0.55)",
  white: "rgba(255,255,255,0.32)",
};

function CodeRow({
  tokens,
  indent = 0,
}: {
  tokens: [number, string][];
  indent?: number;
}) {
  return (
    <div className="flex gap-1.5" style={{ paddingLeft: `${indent * 6}px` }}>
      {tokens.map(([w, color], i) => (
        <div
          key={i}
          className="h-1.5 rounded-sm"
          style={{ width: `${w}%`, background: TOKEN_COLOR[color] }}
        />
      ))}
    </div>
  );
}

// Lens-as-vignette: warm filter strongest at the periphery, mild at the
// center. Reads as "you're seeing this through a lens" without altering
// the monitor itself.
function BlueEffect({ after }: EffectProps) {
  if (!after) return null;
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          "radial-gradient(ellipse 130% 110% at 50% 50%, rgba(255,180,120,0.10) 0%, rgba(255,170,110,0.18) 55%, rgba(220,135,80,0.32) 100%)",
      }}
    />
  );
}

/* =============================== PHOTOCHROMIC =============================== */

function PhotochromicBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #FFE5A8 0%, #FFC988 38%, #FFA86E 62%, #E8845A 80%, #B85A3E 100%)",
        }}
      />

      <div className="absolute right-[12%] top-[10%] w-32 h-32">
        <div
          aria-hidden
          className="absolute inset-[-55%] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,240,200,0.55) 0%, rgba(255,220,160,0.22) 35%, transparent 70%)",
            filter: "blur(12px)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-[-15%] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,250,220,0.85) 0%, rgba(255,235,180,0.4) 50%, transparent 80%)",
            filter: "blur(4px)",
          }}
        />
        <div
          className="absolute inset-0 rounded-full bg-[#FFF6D4]"
          style={{ boxShadow: "0 0 40px rgba(255,240,200,0.9)" }}
        />
      </div>

      <svg
        viewBox="0 0 800 500"
        className="absolute bottom-0 w-full h-2/3"
        preserveAspectRatio="none"
      >
        <polygon
          points="0,500 120,310 250,260 360,290 480,250 600,280 740,240 800,260 800,500"
          fill="rgba(80,90,110,0.45)"
        />
        <polygon
          points="0,500 200,260 340,310 500,200 660,275 800,235 800,500"
          fill="rgba(60,75,80,0.62)"
        />
        <polygon
          points="0,500 250,200 400,300 600,140 800,260 800,500"
          fill="rgba(40,55,50,0.85)"
        />
      </svg>

      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(60,40,30,0.25) 50%, rgba(20,15,10,0.5) 100%)",
        }}
      />
    </div>
  );
}

function PhotochromicEffect({ after }: EffectProps) {
  if (!after) return null;
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          "linear-gradient(180deg, rgba(80,40,20,0.45), rgba(40,30,15,0.55))",
        mixBlendMode: "multiply",
      }}
    />
  );
}

/* =============================== HYDROPHOBIC =============================== */

function HydroDisk({ children, withFrame }: { children?: ReactNode; withFrame?: boolean }) {
  return (
    <div className="absolute inset-0 grid place-items-center pointer-events-none">
      <div
        className={`relative w-[55%] aspect-square rounded-full overflow-hidden ${
          withFrame
            ? "bg-white/10 border border-white/25 backdrop-blur-sm"
            : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function HydroBackground() {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#7B9BC5] via-[#5C7FB0] to-[#3F5F95]">
      <HydroDisk withFrame>
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 30% at 35% 25%, rgba(255,255,255,0.34), transparent 70%), radial-gradient(ellipse 55% 25% at 70% 80%, rgba(255,255,255,0.10), transparent 70%)",
          }}
        />
      </HydroDisk>
    </div>
  );
}

function HydroEffect({ after }: EffectProps) {
  return (
    <HydroDisk>{after ? <HydroDrops /> : <HydroSmears />}</HydroDisk>
  );
}

function HydroDrops() {
  const drops = [
    { left: 18, top: 22, size: 28, delay: 0 },
    { left: 62, top: 18, size: 22, delay: 0.5 },
    { left: 32, top: 48, size: 36, delay: 0.2 },
    { left: 72, top: 46, size: 18, delay: 0.8 },
    { left: 50, top: 30, size: 14, delay: 1.1 },
    { left: 22, top: 68, size: 24, delay: 0.4 },
    { left: 58, top: 70, size: 30, delay: 0.7 },
    { left: 78, top: 28, size: 16, delay: 0.9 },
    { left: 44, top: 78, size: 20, delay: 0.3 },
  ];
  return (
    <>
      {drops.map((d, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            background:
              "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.95) 0%, rgba(210,230,255,0.78) 28%, rgba(140,180,225,0.55) 60%, rgba(95,140,200,0.42) 100%)",
            boxShadow:
              "0 3px 8px rgba(0,0,0,0.22), inset -2px -3px 6px rgba(80,120,180,0.32), inset 2px 2px 3px rgba(255,255,255,0.4)",
          }}
          animate={{ y: [0, 6 + (i % 3) * 2, 0] }}
          transition={{
            duration: 3 + i * 0.27,
            repeat: Infinity,
            ease: "easeInOut",
            delay: d.delay,
          }}
        >
          <div
            aria-hidden
            className="absolute rounded-full"
            style={{
              left: "20%",
              top: "16%",
              width: "30%",
              height: "20%",
              background: "rgba(255,255,255,0.85)",
              filter: "blur(0.8px)",
            }}
          />
        </motion.div>
      ))}
    </>
  );
}

function HydroSmears() {
  return (
    <>
      {[18, 32, 48, 62, 76].map((top, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white/35"
          style={{
            left: "4%",
            top: `${top}%`,
            width: "88%",
            height: 3 + (i % 3),
            filter: "blur(3px)",
          }}
        />
      ))}
      {[18, 38, 58, 78].map((x, i) => (
        <div
          key={`d-${i}`}
          className="absolute rounded-full bg-white/30"
          style={{
            left: `${x}%`,
            top: "10%",
            width: 3 + (i % 2),
            height: "78%",
            filter: "blur(2.5px)",
          }}
        />
      ))}
      <div
        className="absolute inset-3 rounded-full bg-white/12"
        style={{ filter: "blur(12px)", mixBlendMode: "overlay" }}
      />
    </>
  );
}

/* =============================== SCRATCH =============================== */
// Static explainer instead of a slider — magical disappearance of
// scratches under a slider would overpromise.
function ScratchExplainer() {
  return (
    <div className="relative w-full aspect-[16/10] rounded-3xl overflow-hidden border border-ink-50 shadow-card bg-gradient-to-br from-[#F5F8FC] via-white to-[#EBF1F8] select-none">
      <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-ink-900 text-white text-xs font-bold tracking-wider uppercase">
        표면 경도 강화
      </div>

      <div className="absolute inset-0 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-4 lg:gap-6 px-6 sm:px-8 pt-16 pb-12">
        <div className="relative grid place-items-center">
          <svg viewBox="0 0 420 280" className="w-full max-w-[420px] h-auto">
            <defs>
              <linearGradient id="substrate-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D6E1F2" />
                <stop offset="100%" stopColor="#B8C8E0" />
              </linearGradient>
            </defs>

            <rect
              x="40"
              y="118"
              width="340"
              height="110"
              rx="55"
              fill="url(#substrate-grad)"
              stroke="#8AA3C2"
              strokeWidth="1.2"
            />
            <path
              d="M40 118 Q 40 90 95 90 L 325 90 Q 380 90 380 118 Z"
              fill="#3182F6"
              opacity="0.92"
            />
            <path
              d="M65 95 Q 95 80 130 80 L 290 80 Q 325 80 355 95"
              stroke="#7B61FF"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />

            <g fontFamily="inherit" fontSize="13" fill="#191F28">
              <line x1="200" y1="78" x2="240" y2="40" stroke="#7B61FF" strokeWidth="1.2" />
              <text x="244" y="38" fontWeight="700" fill="#7B61FF">
                표면 외층
              </text>

              <line x1="120" y1="100" x2="60" y2="50" stroke="#3182F6" strokeWidth="1.2" />
              <text x="20" y="38" fontWeight="700" fill="#3182F6">
                하드코트
              </text>
              <text x="20" y="54" fontSize="11" fill="#4E5968">
                단단한 보호층
              </text>

              <line x1="210" y1="170" x2="240" y2="252" stroke="#8AA3C2" strokeWidth="1.2" />
              <text x="244" y="258" fontWeight="700" fill="#4E5968">
                렌즈 본체
              </text>
            </g>
          </svg>
        </div>

        <div className="self-center">
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-ink-900 leading-tight">
            긁힘에 더 잘 견디는 표면
          </div>
          <p className="mt-3 text-ink-500 leading-relaxed text-sm sm:text-[15px]">
            렌즈 위에 단단한 하드코트 층을 올려, 일상에서 생기는 미세한 마찰을 덜 받게 만듭니다.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-ink-700">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
              <span>매일 닦을 때 생기는 잔기스에 더 강함</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
              <span>활동량이 많은 일상에 권장</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 max-w-[92%] px-3 py-1.5 rounded-full bg-white/85 backdrop-blur text-ink-500 text-[10px] font-medium tracking-wide text-center">
        * 스크래치를 완전히 막지는 않으며, 거친 표면이나 강한 충격에는 손상될 수 있습니다
      </div>
    </div>
  );
}
