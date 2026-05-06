"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useWizard } from "@/lib/store";
import { PURPOSES } from "@/lib/data";
import { SectionTitle } from "@/components/ui/ScreenShell";
import { SelectCard } from "@/components/ui/SelectCard";

const KEYWORD_HINTS: Record<string, string[]> = {
  screen: ["블루라이트", "비반사"],
  driving: ["비반사", "변색"],
  reading: ["근거리 시야", "오피스"],
  indoor_outdoor: ["변색"],
  outdoor: ["변색", "발수·방오"],
  lightweight: ["고굴절(1.67↑)"],
  progressive_curious: ["누진다초점"],
};

export function PurposeScreen() {
  const purposes = useWizard((s) => s.purposes);
  const togglePurpose = useWizard((s) => s.togglePurpose);

  const hints = Array.from(
    new Set(purposes.flatMap((p) => KEYWORD_HINTS[p] ?? []))
  );

  return (
    <div className="h-full overflow-y-auto overscroll-contain px-4 sm:px-8 lg:px-20 pb-8 sm:pb-10">
      <div className="max-w-6xl mx-auto pt-4">
        <SectionTitle
          eyebrow="STEP 1"
          title={
            <>
              안경을 주로 <span className="gradient-text">언제</span> 사용하시나요?
            </>
          }
          desc="해당되는 항목을 모두 골라주세요. 선택할수록 비교 안내가 더 정확해져요."
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-2.5 sm:gap-3 mt-6 sm:mt-10">
          {PURPOSES.map((p, i) => (
            <SelectCard
              key={p.id}
              index={i}
              selected={purposes.includes(p.id)}
              onClick={() => togglePurpose(p.id)}
              emoji={p.emoji}
              label={p.label}
              desc={p.desc}
            />
          ))}
        </div>

        {/* live recommendation hints */}
        <motion.div
          initial={false}
          animate={{ opacity: hints.length ? 1 : 0.5 }}
          className="mt-5 sm:mt-8 p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-ink-50 shadow-soft flex items-center gap-3 sm:gap-4"
        >
          <div
            aria-hidden="true"
            className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-brand-soft text-brand grid place-items-center"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 2v2m0 12v2M2 10h2m12 0h2M4.2 4.2l1.4 1.4m8.8 8.8l1.4 1.4M4.2 15.8l1.4-1.4m8.8-8.8l1.4-1.4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] sm:text-xs text-ink-400 font-semibold tracking-wider uppercase">
              관련 옵션 키워드
            </div>
            <div
              role="status"
              aria-live="polite"
              aria-atomic="true"
              aria-label={
                hints.length > 0
                  ? `관련 옵션 키워드: ${hints.join(", ")}`
                  : "선택할수록 관련 키워드가 여기에 떠요"
              }
              className="mt-1 sm:mt-1.5 flex flex-wrap items-center gap-1.5 sm:gap-2"
            >
              <AnimatePresence mode="popLayout">
                {hints.length === 0 && (
                  <motion.span
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs sm:text-sm text-ink-400"
                  >
                    선택할수록 관련 키워드가 여기에 떠요
                  </motion.span>
                )}
                {hints.map((h) => (
                  <motion.span
                    key={h}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 350, damping: 22 }}
                    className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-brand-soft text-brand-dark font-semibold text-xs sm:text-sm"
                  >
                    {h}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-[10px] sm:text-xs text-ink-400 uppercase tracking-wider">선택</div>
            <div className="text-lg sm:text-xl font-bold text-ink-900 font-num leading-tight">
              {purposes.length}
              <span className="text-ink-400 text-sm sm:text-base font-medium"> / {PURPOSES.length}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
