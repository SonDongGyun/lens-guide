"use client";

import { useContactsWizard } from "@/lib/contacts/store";
import { WEAR_PATTERNS } from "@/lib/contacts/data";
import { SectionTitle } from "@/components/ui/ScreenShell";
import { SelectCard } from "@/components/ui/SelectCard";

export function WearPatternScreen() {
  const wearPattern = useContactsWizard((s) => s.wearPattern);
  const setWearPattern = useContactsWizard((s) => s.setWearPattern);

  return (
    <div className="h-full overflow-y-auto overscroll-contain px-4 sm:px-8 lg:px-20 pb-8 sm:pb-10">
      <div className="max-w-6xl mx-auto pt-4">
        <SectionTitle
          eyebrow="STEP 1"
          title={
            <>
              하루에 얼마나 <span className="gradient-text">착용</span>하시나요?
            </>
          }
          desc="평소 착용 시간에 따라 추천 재질·교체주기가 크게 달라져요. 한 가지만 골라주세요."
        />

        <div className="grid md:grid-cols-2 gap-2.5 sm:gap-3 mt-6 sm:mt-10">
          {WEAR_PATTERNS.map((p, i) => (
            <SelectCard
              key={p.id}
              index={i}
              selected={wearPattern === p.id}
              onClick={() => setWearPattern(p.id)}
              emoji={p.emoji}
              label={p.label}
              desc={p.desc}
            />
          ))}
        </div>

        <p className="mt-5 sm:mt-7 text-xs sm:text-sm text-ink-400 leading-relaxed">
          * 8시간 이상 착용 시 산소투과도가 높은 재질을 우선 권장드려요.
        </p>
      </div>
    </div>
  );
}
