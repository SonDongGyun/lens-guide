"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useEffect } from "react";
import {
  useContactsWizard,
  type ContactsScreenId,
} from "@/lib/contacts/store";
import { useKioskGuards } from "@/lib/useKioskGuards";
import { useScreenChangeA11y } from "@/lib/useScreenChangeA11y";
import { KioskFrame } from "@/components/ui/KioskFrame";
import { ProgressBar, type ProgressStep } from "@/components/ui/ProgressBar";
import { WelcomeContactsScreen } from "@/components/contacts/screens/WelcomeContactsScreen";
import { WearPatternScreen } from "@/components/contacts/screens/WearPatternScreen";
import { CorrectionScreen } from "@/components/contacts/screens/CorrectionScreen";
import { ContactDiscomfortScreen } from "@/components/contacts/screens/ContactDiscomfortScreen";
import { MaterialCompareScreen } from "@/components/contacts/screens/MaterialCompareScreen";
import { ReplacementCompareScreen } from "@/components/contacts/screens/ReplacementCompareScreen";
import { CosmeticEffectScreen } from "@/components/contacts/screens/CosmeticEffectScreen";
import { ContactsResultScreen } from "@/components/contacts/screens/ContactsResultScreen";
import { ContactsStaffScreen } from "@/components/contacts/screens/ContactsStaffScreen";

const SCREENS: Record<ContactsScreenId, React.ComponentType> = {
  welcome: WelcomeContactsScreen,
  "wear-pattern": WearPatternScreen,
  correction: CorrectionScreen,
  discomfort: ContactDiscomfortScreen,
  material: MaterialCompareScreen,
  replacement: ReplacementCompareScreen,
  cosmetic: CosmeticEffectScreen,
  result: ContactsResultScreen,
  staff: ContactsStaffScreen,
};

const SCREEN_LABELS: Record<ContactsScreenId, string> = {
  welcome: "환영 화면",
  "wear-pattern": "1단계: 착용 패턴 선택",
  correction: "2단계: 시력 교정 종류",
  discomfort: "3단계: 불편 포인트 선택",
  material: "4단계: 재질 비교",
  replacement: "5단계: 교체 주기 비교",
  cosmetic: "6단계: 시각 효과 옵션",
  result: "결과 안내",
  staff: "직원 안내 화면",
};

const PROGRESS_STEPS: ProgressStep<ContactsScreenId>[] = [
  { id: "wear-pattern", label: "착용 패턴" },
  { id: "correction", label: "교정 종류" },
  { id: "discomfort", label: "불편 포인트" },
  { id: "material", label: "재질 비교" },
  { id: "replacement", label: "교체 주기" },
  { id: "cosmetic", label: "시각 효과" },
  { id: "result", label: "결과" },
];

export default function ContactsPage() {
  // Manual rehydrate for SSR/CSR markup parity. Same rationale as the
  // glasses route — see lib/contacts/store skipHydration comment.
  useEffect(() => {
    useContactsWizard.persist.rehydrate();
  }, []);

  const screen = useContactsWizard((s) => s.screen);
  const direction = useContactsWizard((s) => s.direction);
  const next = useContactsWizard((s) => s.next);
  const prev = useContactsWizard((s) => s.prev);
  const wearPattern = useContactsWizard((s) => s.wearPattern);
  const correctionType = useContactsWizard((s) => s.correctionType);

  useKioskGuards({ screen, welcomeScreen: "welcome", prev });

  const ActiveScreen = SCREENS[screen];

  const { containerRef: setScreenContainer, announcement } =
    useScreenChangeA11y(screen, SCREEN_LABELS);

  // Footer behavior. Discomfort/material/replacement/cosmetic are
  // always advanceable — the recommendation engine works with empty
  // discomforts (conservative defaults) and material/replacement use
  // their recommended values when the user hasn't pinned an override.
  const footer = (() => {
    switch (screen) {
      case "welcome":
        return null;
      case "wear-pattern":
        return {
          primary: { label: "다음", onClick: next, disabled: !wearPattern },
          secondary: { label: "이전", onClick: prev },
        };
      case "correction":
        return {
          primary: { label: "다음", onClick: next, disabled: !correctionType },
          secondary: { label: "이전", onClick: prev },
        };
      case "discomfort":
      case "material":
      case "replacement":
      case "cosmetic":
        return {
          primary: { label: "다음", onClick: next },
          secondary: { label: "이전", onClick: prev },
        };
      case "result":
        return {
          primary: { label: "직원에게 결과 보여주기", onClick: next },
          secondary: { label: "다시 비교하기", onClick: prev },
        };
      case "staff":
        return null;
    }
  })();

  const progress =
    screen === "welcome" || screen === "staff" ? null : (
      <ProgressBar
        steps={PROGRESS_STEPS}
        current={screen}
        title="내게 맞는 콘택트 찾기"
      />
    );

  return (
    <MotionConfig reducedMotion="user">
      <KioskFrame
        primary={footer?.primary}
        secondary={footer?.secondary}
        progress={progress}
      >
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            ref={setScreenContainer}
            key={screen}
            role="region"
            aria-label={SCREEN_LABELS[screen]}
            tabIndex={-1}
            initial={{ opacity: 0, x: direction === 1 ? 32 : -32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction === 1 ? -32 : 32 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 outline-none"
          >
            <ActiveScreen />
          </motion.div>
        </AnimatePresence>
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {announcement}
        </div>
      </KioskFrame>
    </MotionConfig>
  );
}
