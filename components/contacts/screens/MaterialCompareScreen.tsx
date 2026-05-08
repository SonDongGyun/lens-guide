"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useContactsWizard } from "@/lib/contacts/store";
import { MATERIALS, type MaterialId } from "@/lib/contacts/data";
import { recommendContacts } from "@/lib/contacts/recommendation";
import { SectionTitle } from "@/components/ui/ScreenShell";
import { OxygenFlowVisual } from "@/components/contacts/visuals/OxygenFlowVisual";
import { cn } from "@/lib/utils";

const ORDER: MaterialId[] = ["silicone_hydrogel", "hydrogel"];

export function MaterialCompareScreen() {
  const wearPattern = useContactsWizard((s) => s.wearPattern);
  const correctionType = useContactsWizard((s) => s.correctionType);
  const discomforts = useContactsWizard((s) => s.discomforts);
  const primaryDiscomfort = useContactsWizard((s) => s.primaryDiscomfort);
  const selectedMaterial = useContactsWizard((s) => s.selectedMaterial);
  const setMaterial = useContactsWizard((s) => s.setMaterial);

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

  const effective: MaterialId = selectedMaterial ?? rec.material;

  return (
    <div className="h-full overflow-y-auto overscroll-contain px-4 sm:px-8 lg:px-20 pb-8 sm:pb-10">
      <div className="max-w-6xl mx-auto pt-4">
        <SectionTitle
          eyebrow="STEP 4"
          title={
            <>
              재질, <span className="gradient-text">산소투과</span>와 <span className="gradient-text">함수율</span>로 비교해요
            </>
          }
          desc="두 재질을 나란히 보고 마음에 드는 쪽을 골라주세요. 입력하신 패턴에 맞춘 추천을 표시했어요."
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-5 sm:mt-7 rounded-2xl sm:rounded-3xl bg-white border border-ink-50 shadow-soft overflow-hidden"
        >
          <OxygenFlowVisual />
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-ink-50 text-[11px] sm:text-xs text-ink-500 leading-relaxed">
            <span className="font-semibold text-ink-700">실리콘 하이드로겔</span>은 산소투과도가 약 5–8배 높아 풀데이 착용에서도 각막에 산소가 충분히 도달해요. <span className="font-semibold text-ink-700">하이드로겔</span>은 함수율이 더 높아 첫 촉촉함이 강하지만, 산소량은 상대적으로 부족합니다.
          </div>
        </motion.div>

        <div className="mt-6 sm:mt-8 grid md:grid-cols-2 gap-3 sm:gap-5">
          {ORDER.map((id, i) => {
            const m = MATERIALS[id];
            const isRecommended = rec.material === id;
            const isPicked = effective === id;
            return (
              <motion.button
                key={id}
                type="button"
                aria-pressed={isPicked}
                onClick={() => setMaterial(id)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i * 0.06,
                  type: "spring",
                  stiffness: 200,
                  damping: 22,
                }}
                whileTap={{ scale: 0.99 }}
                className={cn(
                  "relative text-left p-5 sm:p-7 rounded-3xl border transition-all w-full",
                  isPicked
                    ? "bg-brand-soft border-brand shadow-[0_16px_40px_rgba(49,130,246,0.18)]"
                    : "bg-white border-ink-50 hover:border-ink-100 hover:shadow-card"
                )}
              >
                {isRecommended && (
                  <div className="absolute -top-2 left-5 sm:left-7 px-2.5 py-1 rounded-full bg-ink-900 text-white text-[10px] sm:text-xs font-bold tracking-wider uppercase">
                    추천
                  </div>
                )}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div
                      className={cn(
                        "text-lg sm:text-2xl font-bold tracking-tight",
                        isPicked ? "text-brand-dark" : "text-ink-900"
                      )}
                    >
                      {m.label}
                    </div>
                    <div
                      className={cn(
                        "text-xs sm:text-sm mt-1 leading-snug",
                        isPicked ? "text-brand-dark/80" : "text-ink-500"
                      )}
                    >
                      {m.tagline}
                    </div>
                  </div>
                  {isPicked && (
                    <div
                      aria-hidden="true"
                      className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand text-white grid place-items-center"
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

                <div className="mt-4 sm:mt-5 space-y-2.5 sm:space-y-3">
                  <StarRow label="산소투과도" value={m.oxygenStars} accent={isPicked} />
                  <StarRow label="함수율(첫 촉촉함)" value={m.waterStars} accent={isPicked} />
                  <StarRow label="장시간 편안함" value={m.comfortStars} accent={isPicked} />
                </div>

                <p
                  className={cn(
                    "mt-4 sm:mt-5 text-xs sm:text-sm leading-relaxed",
                    isPicked ? "text-brand-dark/80" : "text-ink-500"
                  )}
                >
                  {m.description}
                </p>

                <div
                  className={cn(
                    "mt-3 sm:mt-4 text-[11px] sm:text-xs font-semibold tracking-wider uppercase",
                    isPicked ? "text-brand" : "text-ink-400"
                  )}
                >
                  추천 사용 · {m.bestFor}
                </div>
              </motion.button>
            );
          })}
        </div>

        {selectedMaterial && selectedMaterial !== rec.material && (
          <div className="mt-5 sm:mt-6 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-ink-500">
            <span>추천은 {MATERIALS[rec.material].label}이에요.</span>
            <button
              type="button"
              onClick={() => setMaterial(null)}
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
}: {
  label: string;
  value: number;
  accent: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "w-28 sm:w-32 shrink-0 text-[11px] sm:text-xs font-semibold tracking-wide",
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
              "block w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm",
              i < value
                ? accent
                  ? "bg-brand"
                  : "bg-ink-700"
                : "bg-ink-50"
            )}
          />
        ))}
      </div>
    </div>
  );
}
