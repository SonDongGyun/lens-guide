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
import { WelcomeContactsScreen } from "@/components/contacts/screens/WelcomeContactsScreen";

// Screens registered here are rendered when their id is the active
// ContactsScreenId. Steps still in development show a stub instead so
// the wizard remains navigable end-to-end while screens land one by
// one.
const SCREENS: Partial<Record<ContactsScreenId, React.ComponentType>> = {
  welcome: WelcomeContactsScreen,
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

  useKioskGuards({ screen, welcomeScreen: "welcome", prev });

  const ActiveScreen = SCREENS[screen];

  const { containerRef: setScreenContainer, announcement } =
    useScreenChangeA11y(screen, SCREEN_LABELS);

  const footer = (() => {
    switch (screen) {
      case "welcome":
        return null;
      case "wear-pattern":
      case "correction":
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

  return (
    <MotionConfig reducedMotion="user">
      <KioskFrame primary={footer?.primary} secondary={footer?.secondary}>
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
            {ActiveScreen ? (
              <ActiveScreen />
            ) : (
              <ScreenStub label={SCREEN_LABELS[screen]} />
            )}
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

// Placeholder shown for not-yet-implemented screens so the wizard can
// be walked through during development. Replaced as each screen lands.
function ScreenStub({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center px-6 text-center">
      <div className="max-w-md">
        <div className="text-xs font-semibold tracking-wider uppercase text-ink-400 mb-3">
          준비 중
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-ink-900 mb-3">
          {label}
        </h2>
        <p className="text-sm text-ink-500">
          이 화면은 아직 작업 중이에요. 다음 단계에서 채워질 예정입니다.
        </p>
      </div>
    </div>
  );
}
