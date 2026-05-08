"use client";

import { useContactsWizard } from "@/lib/contacts/store";
import { CORRECTION_TYPES } from "@/lib/contacts/data";
import { SectionTitle } from "@/components/ui/ScreenShell";
import { SelectCard } from "@/components/ui/SelectCard";

export function CorrectionScreen() {
  const correctionType = useContactsWizard((s) => s.correctionType);
  const setCorrectionType = useContactsWizard((s) => s.setCorrectionType);

  return (
    <div className="h-full overflow-y-auto overscroll-contain px-4 sm:px-8 lg:px-20 pb-8 sm:pb-10">
      <div className="max-w-6xl mx-auto pt-4">
        <SectionTitle
          eyebrow="STEP 2"
          title={
            <>
              어떤 <span className="gradient-text">교정</span>이 필요하신가요?
            </>
          }
          desc="처방의 큰 분류만 알려주시면 됩니다. 정확한 도수·BC·DIA는 매장에서 측정해드려요."
        />

        <div className="grid md:grid-cols-2 gap-2.5 sm:gap-3 mt-6 sm:mt-10">
          {CORRECTION_TYPES.map((t, i) => (
            <SelectCard
              key={t.id}
              index={i}
              selected={correctionType === t.id}
              onClick={() => setCorrectionType(t.id)}
              emoji={t.emoji}
              label={t.label}
              desc={t.desc}
            />
          ))}
        </div>

        <p className="mt-5 sm:mt-7 text-xs sm:text-sm text-ink-400 leading-relaxed">
          * 잘 모르겠으면 평소 안경 도수 종류를 떠올려 보세요. 매장에서 다시 측정합니다.
        </p>
      </div>
    </div>
  );
}
