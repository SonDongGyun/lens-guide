"use client";

import { useContactsWizard } from "@/lib/contacts/store";
import { COSMETIC_EFFECTS, type CosmeticEffectId } from "@/lib/contacts/data";
import { SectionTitle } from "@/components/ui/ScreenShell";
import { SelectCard } from "@/components/ui/SelectCard";

const ORDER: CosmeticEffectId[] = ["clear", "natural", "circle"];

export function CosmeticEffectScreen() {
  const cosmeticEffect = useContactsWizard((s) => s.cosmeticEffect);
  const setCosmeticEffect = useContactsWizard((s) => s.setCosmeticEffect);

  return (
    <div className="h-full overflow-y-auto overscroll-contain px-4 sm:px-8 lg:px-20 pb-8 sm:pb-10">
      <div className="max-w-6xl mx-auto pt-4">
        <SectionTitle
          eyebrow="STEP 6"
          title={
            <>
              마지막으로, <span className="gradient-text">시각 효과</span>는 어떻게 할까요?
            </>
          }
          desc="투명·내추럴·서클 중 원하는 인상을 골라주세요. 도수가 같아도 색상·디자인은 따로 정하실 수 있어요."
        />

        <div className="grid md:grid-cols-3 gap-2.5 sm:gap-3 mt-6 sm:mt-10">
          {ORDER.map((id, i) => {
            const e = COSMETIC_EFFECTS[id];
            return (
              <SelectCard
                key={id}
                index={i}
                selected={cosmeticEffect === id}
                onClick={() => setCosmeticEffect(id)}
                emoji={e.emoji}
                label={e.label}
                desc={e.desc}
              />
            );
          })}
        </div>

        <p className="mt-5 sm:mt-7 text-xs sm:text-sm text-ink-400 leading-relaxed">
          * 컬러·서클 렌즈는 모델별로 산소투과도와 인쇄 위치가 달라요. 매장에서 실착용 트라이얼 후 결정하시는 걸 권장드려요.
        </p>
      </div>
    </div>
  );
}
