"use client";

import { motion } from "framer-motion";
import type { CoatingId } from "@/lib/data";
import { useState } from "react";

interface Props {
  id: CoatingId;
}

/**
 * Each coating has a "before" (no coating) and "after" (with coating) scene.
 * We split-render them via a draggable divider for a satisfying compare.
 */
export function CoatingDemo({ id }: Props) {
  const [split, setSplit] = useState(50);

  return (
    <div className="relative w-full aspect-[16/10] rounded-3xl overflow-hidden border border-ink-50 shadow-card select-none">
      {/* AFTER (full bg) */}
      <Scene id={id} after />

      {/* BEFORE clipped to left */}
      <div
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${split}%` }}
      >
        <div className="relative w-screen max-w-none h-full">
          <Scene id={id} after={false} />
        </div>
      </div>

      {/* Divider */}
      <motion.div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-elevated cursor-ew-resize"
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

      {/* Range fallback for keyboard / kiosk */}
      <input
        aria-label="Coating compare slider"
        type="range"
        min={5}
        max={95}
        value={split}
        onChange={(e) => setSplit(Number(e.target.value))}
        className="absolute bottom-3 left-1/2 -translate-x-1/2 w-1/2 accent-brand opacity-0"
      />

      {/* Labels */}
      <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur text-white text-xs font-bold tracking-wider uppercase">
        코팅 없음
      </div>
      <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-brand text-white text-xs font-bold tracking-wider uppercase shadow-md">
        코팅 적용
      </div>

      {/* invisible root for drag math */}
      <div data-compare-root className="absolute inset-0 pointer-events-none" />
    </div>
  );
}

/** Renders the actual before/after scene per coating. */
function Scene({ id, after }: { id: CoatingId; after: boolean }) {
  if (id === "ar") return <ARScene after={after} />;
  if (id === "blue") return <BlueScene after={after} />;
  if (id === "photochromic") return <PhotochromicScene after={after} />;
  if (id === "hydrophobic") return <HydroScene after={after} />;
  return <ScratchScene after={after} />;
}

/* ----------------- Anti-Reflective: night driving ----------------- */
function ARScene({ after }: { after: boolean }) {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#0B1220] via-[#101830] to-[#1A2240]">
      {/* road */}
      <svg viewBox="0 0 800 500" className="absolute inset-0 w-full h-full">
        <polygon points="350,500 450,500 550,260 250,260" fill="#0E1626" />
        <rect x="396" y="280" width="8" height="14" fill="#FBBF24" />
        <rect x="394" y="320" width="12" height="20" fill="#FBBF24" />
        <rect x="390" y="380" width="20" height="28" fill="#FBBF24" />
      </svg>

      {/* oncoming headlights */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[44%] flex gap-8">
        <div className="w-3 h-3 rounded-full bg-yellow-100" />
        <div className="w-3 h-3 rounded-full bg-yellow-100" />
      </div>

      {/* the lens "glare" - what we toggle */}
      {!after && (
        <>
          <div
            className="absolute left-1/2 -translate-x-1/2 top-[40%] w-80 h-40"
            style={{
              background:
                "radial-gradient(ellipse, rgba(255,255,180,0.7), rgba(255,255,180,0.2) 40%, transparent 70%)",
              filter: "blur(8px)",
            }}
          />
          <div className="absolute inset-0 mix-blend-screen opacity-70">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-full h-px"
                style={{
                  top: `${30 + i * 6}%`,
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,180,0.5), transparent)",
                  filter: "blur(2px)",
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ----------------- Blue light: monitor at night ----------------- */
function BlueScene({ after }: { after: boolean }) {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#0F1A2B] to-[#1A2540] grid place-items-center">
      <div
        className={`relative w-[60%] h-[70%] rounded-xl border-2 transition-all duration-500 ${
          after ? "border-amber-200/40" : "border-blue-300/40"
        }`}
        style={{
          background: after
            ? "linear-gradient(160deg, rgba(255,200,140,0.35), rgba(255,180,90,0.25))"
            : "linear-gradient(160deg, rgba(120,170,255,0.7), rgba(80,140,255,0.5))",
          boxShadow: after
            ? "0 0 80px rgba(255,200,120,0.4)"
            : "0 0 80px rgba(80,140,255,0.55)",
        }}
      >
        <div className="absolute inset-3 grid grid-cols-3 gap-1.5">
          <div className="bg-white/40 rounded" />
          <div className="bg-white/30 rounded col-span-2" />
          <div className="bg-white/25 rounded col-span-3 h-2" />
          <div className="bg-white/20 rounded col-span-3" />
          <div className="bg-white/35 rounded" />
          <div className="bg-white/20 rounded col-span-2" />
        </div>
      </div>
    </div>
  );
}

/* ----------------- Photochromic: outdoor lens darkening ----------------- */
function PhotochromicScene({ after }: { after: boolean }) {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#FFE5A8] via-[#FFB46E] to-[#FF8E4D]">
      {/* sun */}
      <div className="absolute top-10 right-12 w-24 h-24 rounded-full bg-yellow-200 blur-2xl opacity-80" />
      {/* horizon */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-[#0E1626]/30" />
      {/* mountain */}
      <svg viewBox="0 0 800 500" className="absolute bottom-0 w-full h-2/3">
        <polygon points="0,500 250,180 400,300 600,140 800,500" fill="rgba(40,70,40,0.6)" />
      </svg>
      {/* lens overlay - the whole scene gets darker through tinted lens */}
      {after && (
        <div
          className="absolute inset-0 transition-opacity"
          style={{
            background:
              "linear-gradient(180deg, rgba(80,40,20,0.45), rgba(40,30,15,0.55))",
            mixBlendMode: "multiply",
          }}
        />
      )}
    </div>
  );
}

/* ----------------- Hydrophobic: water beads ----------------- */
function HydroScene({ after }: { after: boolean }) {
  // before: smeared streaks; after: clean beads rolling off
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#7B9BC5] via-[#5C7FB0] to-[#3F5F95]">
      {/* lens area circle */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="relative w-[55%] aspect-square rounded-full bg-white/10 border border-white/20 backdrop-blur-sm overflow-hidden">
          {after ? (
            <>
              {Array.from({ length: 7 }).map((_, i) => {
                const left = 10 + (i * 11) % 80;
                const top = 15 + (i * 23) % 70;
                const size = 14 + (i * 7) % 28;
                return (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      left: `${left}%`,
                      top: `${top}%`,
                      width: size,
                      height: size,
                      background:
                        "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(180,210,255,0.7) 50%, rgba(120,160,210,0.4))",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                    }}
                    animate={{ y: [0, 10, 0] }}
                    transition={{
                      duration: 3 + i * 0.3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                );
              })}
            </>
          ) : (
            <>
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute h-1.5 rounded-full bg-white/40"
                  style={{
                    left: "5%",
                    top: `${20 + i * 18}%`,
                    width: "85%",
                    filter: "blur(2px)",
                  }}
                />
              ))}
              <div className="absolute inset-4 rounded-full bg-white/8 mix-blend-overlay" style={{ filter: "blur(8px)" }} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ----------------- Scratch protection ----------------- */
function ScratchScene({ after }: { after: boolean }) {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[#2A3344] to-[#1A2031]">
      <div className="absolute inset-0 grid place-items-center">
        <div className="relative w-[55%] aspect-[5/3] rounded-[40%] bg-white/8 border border-white/20 overflow-hidden">
          {!after && (
            <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full">
              {Array.from({ length: 8 }).map((_, i) => (
                <line
                  key={i}
                  x1={20 + i * 40}
                  y1={40 + i * 20}
                  x2={120 + i * 40}
                  y2={20 + i * 20}
                  stroke="white"
                  strokeOpacity={0.4}
                  strokeWidth={1}
                />
              ))}
              {Array.from({ length: 5 }).map((_, i) => (
                <line
                  key={`v-${i}`}
                  x1={60 + i * 60}
                  y1={150 + i * 10}
                  x2={140 + i * 60}
                  y2={250 + i * 10}
                  stroke="white"
                  strokeOpacity={0.35}
                  strokeWidth={1}
                />
              ))}
            </svg>
          )}
          {after && (
            <div className="absolute inset-0 grid place-items-center text-white/80 text-sm font-medium">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10">
                <span className="w-2 h-2 rounded-full bg-accent-mint" />
                표면이 단단하게 보호됨
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
