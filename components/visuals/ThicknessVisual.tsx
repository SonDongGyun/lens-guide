"use client";

import { motion } from "framer-motion";
import type { IndexId } from "@/lib/data";

interface Props {
  index: IndexId;
  thicknessFactor: number; // 0..1
  prescription: number;
}

/**
 * Side-view of glasses lens cross-section.
 * Edge thickness scales with thicknessFactor and prescription.
 */
export function ThicknessVisual({ index, thicknessFactor, prescription }: Props) {
  const absRx = Math.abs(prescription);
  // base: a -2D lens has small edge; -8D has very thick edge
  const baseEdge = 4 + absRx * 6; // px at factor=1
  const edge = baseEdge * thicknessFactor;
  const center = 4; // minus lens is thin in center

  return (
    <div className="w-full aspect-[16/10] rounded-3xl bg-gradient-to-br from-[#EFF3F8] via-white to-[#E8EEF5] shadow-card relative overflow-hidden border border-ink-50">
      <div
        aria-hidden
        className="absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(123,97,255,0.08), transparent 60%)",
        }}
      />

      {/* Frame outline for context */}
      <svg viewBox="0 0 800 500" className="absolute inset-0 w-full h-full">
        {/* glasses temple (side view) */}
        <g stroke="#191F28" strokeWidth="3" fill="none" strokeLinecap="round">
          <path d="M 80 250 Q 200 220 360 235" />
          <path d="M 580 235 Q 660 245 720 260" />
        </g>

        {/* Lens cross-section (side view) - minus lens shape: thin center, thick edges */}
        <motion.path
          initial={false}
          animate={{
            d: lensPath(edge, center),
          }}
          transition={{ type: "spring", stiffness: 200, damping: 26 }}
          fill="url(#lensGrad)"
          stroke="#3182F6"
          strokeWidth="2"
        />

        <defs>
          <linearGradient id="lensGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(49,130,246,0.35)" />
            <stop offset="50%" stopColor="rgba(123,97,255,0.25)" />
            <stop offset="100%" stopColor="rgba(49,130,246,0.4)" />
          </linearGradient>
        </defs>

        {/* Top thickness label */}
        <motion.g initial={false} animate={{ x: 0 }}>
          {/* edge thickness measurement at right side of lens */}
          <line
            x1="600"
            y1={250 - edge / 2}
            x2="600"
            y2={250 + edge / 2}
            stroke="#3182F6"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          <line
            x1="595"
            y1={250 - edge / 2}
            x2="605"
            y2={250 - edge / 2}
            stroke="#3182F6"
            strokeWidth="2"
          />
          <line
            x1="595"
            y1={250 + edge / 2}
            x2="605"
            y2={250 + edge / 2}
            stroke="#3182F6"
            strokeWidth="2"
          />
        </motion.g>
      </svg>

      {/* center value */}
      <div className="absolute top-6 left-6 px-3 py-1.5 rounded-full bg-ink-900 text-white text-xs font-bold tracking-wider uppercase">
        {index} · 측면도
      </div>
      <motion.div
        className="absolute top-1/2 right-8 -translate-y-1/2 text-right"
        key={index}
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="text-xs uppercase tracking-wider text-ink-400 font-semibold">
          가장자리 두께
        </div>
        <div className="text-3xl font-bold gradient-text font-num">
          {(edge / 8).toFixed(1)}<span className="text-lg text-ink-400 font-medium ml-1">mm</span>
        </div>
        <div className="text-xs text-ink-400 mt-0.5">
          도수 {prescription.toFixed(2)}D 기준
        </div>
      </motion.div>

      {/* explanatory caption */}
      <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between gap-3">
        <div className="px-3 py-1.5 rounded-full bg-white/80 backdrop-blur text-xs text-ink-500 font-medium">
          가운데는 얇고, 가장자리가 두꺼워지는 -도수 렌즈
        </div>
        <div className="px-3 py-1.5 rounded-full bg-white/80 backdrop-blur text-xs text-ink-500 font-medium">
          압축률↑ → 더 얇아짐
        </div>
      </div>
    </div>
  );
}

/**
 * Build a "minus lens" cross-section path:
 * thick edges (top + bottom), thin center.
 */
function lensPath(edge: number, center: number) {
  const cx = 480;
  const lensWidth = 240;
  const left = cx - lensWidth / 2;
  const right = cx + lensWidth / 2;
  const midY = 250;

  // top profile: edge → center → edge (concave curve)
  const topLeft = midY - edge / 2;
  const topCenter = midY - center / 2;
  const topRight = midY - edge / 2;
  const botLeft = midY + edge / 2;
  const botCenter = midY + center / 2;
  const botRight = midY + edge / 2;

  return `
    M ${left} ${topLeft}
    Q ${cx} ${topCenter} ${right} ${topRight}
    L ${right} ${botRight}
    Q ${cx} ${botCenter} ${left} ${botLeft}
    Z
  `;
}
