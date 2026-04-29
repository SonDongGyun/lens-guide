"use client";

import { motion } from "framer-motion";
import type { CoatingId } from "@/lib/data";
import { useState } from "react";

interface Props {
  id: CoatingId;
}

type CompareCoatingId = Exclude<CoatingId, "scratch">;

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

// Scratch protection uses a static explainer rather than a before/after
// slider — magical disappearance of scratches would overpromise.
export function CoatingDemo({ id }: Props) {
  if (id === "scratch") return <ScratchExplainer />;
  return <CompareView id={id} />;
}

function CompareView({ id }: { id: CompareCoatingId }) {
  const [split, setSplit] = useState(50);
  const labels = COMPARE_LABELS[id];

  return (
    <div className="relative w-full aspect-[16/10] rounded-3xl overflow-hidden border border-ink-50 shadow-card select-none">
      <Scene id={id} after />

      <div
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${split}%` }}
      >
        <div className="relative w-screen max-w-none h-full">
          <Scene id={id} after={false} />
        </div>
      </div>

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

      <input
        aria-label="Coating compare slider"
        type="range"
        min={5}
        max={95}
        value={split}
        onChange={(e) => setSplit(Number(e.target.value))}
        className="absolute bottom-3 left-1/2 -translate-x-1/2 w-1/2 accent-brand opacity-0"
      />

      <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur text-white text-xs font-bold tracking-wider uppercase">
        {labels.left}
      </div>
      <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-brand text-white text-xs font-bold tracking-wider uppercase shadow-md">
        {labels.right}
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 max-w-[92%] px-2.5 py-1 rounded-full bg-black/40 backdrop-blur text-white/80 text-[10px] font-medium tracking-wide text-center">
        {labels.disclaimer}
      </div>

      <div data-compare-root className="absolute inset-0 pointer-events-none" />
    </div>
  );
}

function Scene({
  id,
  after,
}: {
  id: CompareCoatingId;
  after: boolean;
}) {
  if (id === "ar") return <ARScene after={after} />;
  if (id === "blue") return <BlueScene after={after} />;
  if (id === "photochromic") return <PhotochromicScene after={after} />;
  return <HydroScene after={after} />;
}

/* ----------------- Anti-Reflective: night driving ----------------- */
function ARScene({ after }: { after: boolean }) {
  // x/y are in 800x500 viewport coords; r=core disk, halo=glow radius,
  // ray=true means render starburst spikes (only the closest headlights).
  const lights = [
    { cx: 358, cy: 308, r: 7, halo: 56, ray: false },
    { cx: 442, cy: 308, r: 7, halo: 56, ray: false },
    { cx: 314, cy: 348, r: 12, halo: 105, ray: true },
    { cx: 486, cy: 348, r: 12, halo: 105, ray: true },
    { cx: 70, cy: 215, r: 6, halo: 42, ray: false },
    { cx: 730, cy: 215, r: 6, halo: 42, ray: false },
    { cx: 200, cy: 198, r: 5, halo: 28, ray: false },
    { cx: 600, cy: 198, r: 5, halo: 28, ray: false },
  ];

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#080E1E] via-[#0F1830] to-[#1A2240] overflow-hidden">
      <svg
        viewBox="0 0 800 500"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
      >
        <polygon
          points="0,260 110,232 200,248 290,225 360,250 0,260"
          fill="#0A1224"
          opacity="0.9"
        />
        <polygon
          points="800,260 690,232 600,248 510,225 440,250 800,260"
          fill="#0A1224"
          opacity="0.9"
        />
        <polygon points="350,500 450,500 555,260 245,260" fill="#0E1626" />
        <rect x="396" y="280" width="8" height="12" fill="#FBBF24" opacity="0.55" />
        <rect x="394" y="318" width="12" height="18" fill="#FBBF24" opacity="0.8" />
        <rect x="390" y="378" width="20" height="26" fill="#FBBF24" />
      </svg>

      {lights.map((l, i) => (
        <div
          key={`core-${i}`}
          className="absolute rounded-full bg-[#FFFAE0]"
          style={{
            left: `${(l.cx / 800) * 100}%`,
            top: `${(l.cy / 500) * 100}%`,
            width: l.r * 2,
            height: l.r * 2,
            transform: "translate(-50%,-50%)",
            boxShadow: "0 0 6px rgba(255,250,210,0.6)",
          }}
        />
      ))}

      {!after &&
        lights.map((l, i) => (
          <div
            key={`halo-${i}`}
            className="absolute"
            style={{
              left: `${(l.cx / 800) * 100}%`,
              top: `${(l.cy / 500) * 100}%`,
              width: l.halo * 2,
              height: l.halo * 2,
              transform: "translate(-50%,-50%)",
              background:
                "radial-gradient(circle, rgba(255,250,210,0.85) 0%, rgba(255,240,170,0.32) 38%, rgba(255,230,140,0) 72%)",
              filter: "blur(3px)",
            }}
          />
        ))}

      {!after && (
        <svg
          viewBox="0 0 800 500"
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
        >
          {lights
            .filter((l) => l.ray)
            .flatMap((l, i) =>
              [0, 45, 90, 135].map((deg) => {
                const rad = (deg * Math.PI) / 180;
                const len = l.halo * 1.5;
                return (
                  <line
                    key={`r-${i}-${deg}`}
                    x1={l.cx - Math.cos(rad) * len}
                    y1={l.cy - Math.sin(rad) * len}
                    x2={l.cx + Math.cos(rad) * len}
                    y2={l.cy + Math.sin(rad) * len}
                    stroke="rgba(255,240,170,0.28)"
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                );
              })
            )}
        </svg>
      )}

      {/* Ghost reflection: dashboard / interior reflecting on the lens
          surface — the visual signature customers recognize from their
          own glasses at night. Only present without AR coating. */}
      {!after && (
        <div
          aria-hidden
          className="absolute inset-x-0 top-[16%] h-[22%] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 50% 100% at 65% 50%, rgba(255,225,170,0.28), transparent 70%), radial-gradient(ellipse 60% 100% at 28% 60%, rgba(180,210,255,0.22), transparent 70%)",
            filter: "blur(10px)",
            mixBlendMode: "screen",
          }}
        />
      )}

      {/* AR coating's faint violet/green sheen near the lens periphery —
          the actual visual signature of an AR-coated lens in photos. */}
      {after && (
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 110% 75% at 50% 50%, transparent 60%, rgba(140,110,255,0.10) 80%, rgba(110,200,150,0.10) 100%)",
          }}
        />
      )}
    </div>
  );
}

/* ----------------- Blue light: monitor at night ----------------- */
// Monitor pixels and glow stay identical in both states; only a soft
// warm overlay appears in AFTER, representing the lens filter — not a
// physical change to the screen itself.
function BlueScene({ after }: { after: boolean }) {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#0F1A2B] to-[#1A2540] grid place-items-center">
      <div
        className="relative w-[60%] h-[70%] rounded-xl border-2 border-blue-300/40"
        style={{
          background:
            "linear-gradient(160deg, rgba(120,170,255,0.65), rgba(80,140,255,0.45))",
          boxShadow: "0 0 80px rgba(80,140,255,0.5)",
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

      {after && (
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ background: "rgba(255,180,120,0.16)" }}
        />
      )}
    </div>
  );
}

/* ----------------- Photochromic: outdoor lens darkening ----------------- */
function PhotochromicScene({ after }: { after: boolean }) {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#FFE5A8] via-[#FFB46E] to-[#FF8E4D]">
      <div className="absolute top-10 right-12 w-24 h-24 rounded-full bg-yellow-200 blur-2xl opacity-80" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-[#0E1626]/30" />
      <svg viewBox="0 0 800 500" className="absolute bottom-0 w-full h-2/3">
        <polygon
          points="0,500 250,180 400,300 600,140 800,500"
          fill="rgba(40,70,40,0.6)"
        />
      </svg>
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
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#7B9BC5] via-[#5C7FB0] to-[#3F5F95]">
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
              <div
                className="absolute inset-4 rounded-full bg-white/8 mix-blend-overlay"
                style={{ filter: "blur(8px)" }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ----------------- Scratch: static explainer (no slider) ----------------- */
// Lens cross-section diagram — chosen over a before/after slider so we
// don't suggest existing scratches vanish or that the coating prevents
// all scratches. Honest disclaimer pinned to the bottom.
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
