"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useContactsWizard } from "@/lib/contacts/store";
import { REPLACEMENTS, type ReplacementId } from "@/lib/contacts/data";
import { recommendContacts } from "@/lib/contacts/recommendation";
import { SectionTitle } from "@/components/ui/ScreenShell";
import { DepositTimelineVisual } from "@/components/contacts/visuals/DepositTimelineVisual";
import { cn } from "@/lib/utils";

const ORDER: ReplacementId[] = ["daily", "biweekly", "monthly"];

export function ReplacementCompareScreen() {
  const wearPattern = useContactsWizard((s) => s.wearPattern);
  const correctionType = useContactsWizard((s) => s.correctionType);
  const discomforts = useContactsWizard((s) => s.discomforts);
  const primaryDiscomfort = useContactsWizard((s) => s.primaryDiscomfort);
  const selectedReplacement = useContactsWizard((s) => s.selectedReplacement);
  const setReplacement = useContactsWizard((s) => s.setReplacement);

  const rec = useMemo(
    () =>
      recommendContacts({
        wearPattern,
        correctionType,
        discomforts,
        primaryDiscomfort,
      }),
    [wearPattern, correctionType, discomforts, primaryDiscomfort]
  );

  const effective: ReplacementId = selectedReplacement ?? rec.replacement;

  return (
    <div className="h-full overflow-y-auto overscroll-contain px-4 sm:px-8 lg:px-20 pb-8 sm:pb-10">
      <div className="max-w-6xl mx-auto pt-4">
        <SectionTitle
          eyebrow="STEP 5"
          title={
            <>
              교체 주기는 <span className="gradient-text">위생</span>과 <span className="gradient-text">비용</span>의 균형이에요
            </>
          }
          desc="자주 교체할수록 위생적이지만 단가는 올라가요. 입력하신 패턴 기반 추천을 표시했어요."
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-5 sm:mt-7 rounded-2xl sm:rounded-3xl bg-white border border-ink-50 shadow-soft overflow-hidden"
        >
          <DepositTimelineVisual />
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-ink-50 text-[11px] sm:text-xs text-ink-500 leading-relaxed">
            <span className="font-semibold text-ink-700">1일</span>은 매일 새 렌즈로 침착물이 쌓일 시간이 없고, <span className="font-semibold text-ink-700">2주용</span>은 두 번에 걸쳐 누적·초기화됩니다. <span className="font-semibold text-ink-700">1개월용</span>은 후반부로 갈수록 단백질·지방 침착이 짙어져 시야와 착용감에 영향을 줄 수 있어요.
          </div>
        </motion.div>

        <div className="mt-6 sm:mt-8 grid gap-3 sm:gap-4">
          {ORDER.map((id, i) => {
            const r = REPLACEMENTS[id];
            const isRecommended = rec.replacement === id;
            const isPicked = effective === id;
            return (
              <motion.button
                key={id}
                type="button"
                aria-pressed={isPicked}
                onClick={() => setReplacement(id)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i * 0.05,
                  type: "spring",
                  stiffness: 200,
                  damping: 22,
                }}
                whileTap={{ scale: 0.99 }}
                whileHover={{ y: -2 }}
                className={cn(
                  "relative text-left p-4 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all w-full",
                  isPicked
                    ? "bg-brand-soft border-brand shadow-[0_12px_28px_rgba(49,130,246,0.16)]"
                    : "bg-white border-ink-50 hover:border-ink-100 hover:shadow-card"
                )}
              >
                {isRecommended && (
                  <div className="absolute -top-2 left-4 sm:left-6 px-2.5 py-1 rounded-full bg-ink-900 text-white text-[10px] sm:text-xs font-bold tracking-wider uppercase">
                    추천
                  </div>
                )}
                <div className="grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_auto] gap-4 sm:gap-6 sm:items-center">
                  <div className="min-w-0">
                    <div
                      className={cn(
                        "text-lg sm:text-xl font-bold tracking-tight",
                        isPicked ? "text-brand-dark" : "text-ink-900"
                      )}
                    >
                      {r.label}
                    </div>
                    <div
                      className={cn(
                        "text-xs sm:text-sm mt-1 leading-snug",
                        isPicked ? "text-brand-dark/80" : "text-ink-500"
                      )}
                    >
                      {r.tagline}
                    </div>
                    <div
                      className={cn(
                        "mt-2 sm:mt-3 text-[11px] sm:text-xs font-semibold tracking-wider uppercase",
                        isPicked ? "text-brand" : "text-ink-400"
                      )}
                    >
                      추천 사용 · {r.bestFor}
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <StarRow
                      label="위생"
                      value={r.hygieneStars}
                      accent={isPicked}
                    />
                    <StarRow
                      label="비용 부담"
                      value={r.costStars}
                      accent={isPicked}
                      negative
                    />
                    <StarRow
                      label="편의성"
                      value={r.convenienceStars}
                      accent={isPicked}
                    />
                  </div>

                  {isPicked && (
                    <div
                      aria-hidden="true"
                      className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand text-white grid place-items-center justify-self-end"
                    >
                      <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                        <path
                          d="M2 7l3.5 3.5L12 4"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <p
                  className={cn(
                    "mt-3 sm:mt-4 text-xs sm:text-sm leading-relaxed",
                    isPicked ? "text-brand-dark/80" : "text-ink-500"
                  )}
                >
                  {r.description}
                </p>
              </motion.button>
            );
          })}
        </div>

        {selectedReplacement && selectedReplacement !== rec.replacement && (
          <div className="mt-5 sm:mt-6 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-ink-500">
            <span>추천은 {REPLACEMENTS[rec.replacement].label}이에요.</span>
            <button
              type="button"
              onClick={() => setReplacement(null)}
              className="font-semibold text-brand underline underline-offset-2 hover:text-brand-dark"
            >
              추천대로 따르기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StarRow({
  label,
  value,
  accent,
  negative = false,
}: {
  label: string;
  value: number;
  accent: boolean;
  // For "비용 부담": more bars = costlier, so we use a different
  // accent color to avoid implying "more is better".
  negative?: boolean;
}) {
  const filled = negative
    ? "bg-accent-coral"
    : accent
      ? "bg-brand"
      : "bg-ink-700";
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "w-20 sm:w-24 shrink-0 text-[11px] sm:text-xs font-semibold tracking-wide",
          accent ? "text-brand-dark/80" : "text-ink-500"
        )}
      >
        {label}
      </div>
      <div
        role="img"
        aria-label={`${label} ${value}점 / 5점`}
        className="flex gap-0.5 sm:gap-1"
      >
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={cn(
              "block w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-sm",
              i < value ? filled : "bg-ink-50"
            )}
          />
        ))}
      </div>
    </div>
  );
}
