"use client";

import { motion } from "framer-motion";
import { useWizard } from "@/lib/store";
import { COATINGS, type CoatingId } from "@/lib/data";
import { SectionTitle } from "@/components/ui/ScreenShell";
import { CoatingDemo } from "@/components/visuals/CoatingDemo";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function CoatingScreen() {
  const coatings = useWizard((s) => s.coatings);
  const toggleCoating = useWizard((s) => s.toggleCoating);
  const [active, setActive] = useState<CoatingId>("ar");

  const info = COATINGS.find((c) => c.id === active)!;
  const isApplied = coatings.includes(active);

  return (
    <div className="h-full overflow-y-auto px-10 lg:px-20 pb-10">
      <div className="max-w-7xl mx-auto pt-4">
        <SectionTitle
          eyebrow="STEP 5"
          title={
            <>
              코팅, <span className="gradient-text">생활에서 어떤 차이</span>가 있을까요?
            </>
          }
          desc="가운데 슬라이더를 좌우로 움직여 코팅 유무를 직접 비교해보세요."
        />

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 mt-8 items-start">
          {/* visual */}
          <div>
            <CoatingDemo id={active} key={active} />

            {/* coating tabs below visual */}
            <div className="mt-4 flex flex-wrap gap-2">
              {COATINGS.map((c) => {
                const isActive = active === c.id;
                const isPicked = coatings.includes(c.id);
                return (
                  <motion.button
                    key={c.id}
                    onClick={() => setActive(c.id)}
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ y: -1 }}
                    className={cn(
                      "px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all flex items-center gap-2",
                      isActive
                        ? "bg-ink-900 text-white shadow-card"
                        : "bg-white border border-ink-50 text-ink-700 hover:border-ink-100"
                    )}
                  >
                    {c.label}
                    {isPicked && (
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          isActive ? "bg-accent-mint" : "bg-brand"
                        )}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* info card + toggle */}
          <motion.div
            key={info.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-7 rounded-3xl bg-white border border-ink-50 shadow-card"
          >
            <div className="text-sm text-brand font-bold tracking-wider uppercase">
              {info.label}
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-ink-900">
              {info.tagline}
            </div>
            <p className="mt-3 text-ink-500 leading-relaxed">{info.description}</p>

            <div className="mt-5 p-4 rounded-2xl bg-bg-muted">
              <div className="text-xs uppercase tracking-wider text-ink-400 font-semibold">
                이런 분께 잘 맞아요
              </div>
              <div className="mt-1 text-ink-900 font-medium">{info.scenario}</div>
            </div>

            <button
              onClick={() => toggleCoating(active)}
              className={cn(
                "mt-6 w-full h-14 rounded-2xl font-bold tracking-tight transition-all flex items-center justify-center gap-2",
                isApplied
                  ? "bg-brand text-white shadow-[0_8px_24px_rgba(49,130,246,0.35)]"
                  : "bg-bg-muted text-ink-700 hover:bg-ink-50"
              )}
            >
              {isApplied ? (
                <>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M4 10l4 4 8-8"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  내 옵션에 추가됨
                </>
              ) : (
                <>옵션에 추가하기</>
              )}
            </button>

            <div className="mt-3 text-xs text-ink-300 text-center">
              {coatings.length}개 코팅 선택됨 · 결과 화면에서 직원이 한눈에 확인합니다
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
