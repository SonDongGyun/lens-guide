"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useEffect } from "react";
import { useWizard, type ScreenId } from "@/lib/store";
import { useKioskGuards } from "@/lib/useKioskGuards";
import { useScreenChangeA11y } from "@/lib/useScreenChangeA11y";
import { KioskFrame } from "@/components/ui/KioskFrame";
import { ProgressBar, type ProgressStep } from "@/components/ui/ProgressBar";
import { WelcomeScreen } from "@/components/screens/WelcomeScreen";
import { PurposeScreen } from "@/components/screens/PurposeScreen";
import { DiscomfortScreen } from "@/components/screens/DiscomfortScreen";
import { LensTypeScreen } from "@/components/screens/LensTypeScreen";
import { ThicknessScreen } from "@/components/screens/ThicknessScreen";
import { CoatingScreen } from "@/components/screens/CoatingScreen";
import { ResultScreen } from "@/components/screens/ResultScreen";
import { StaffScreen } from "@/components/screens/StaffScreen";

const SCREENS: Record<ScreenId, React.ComponentType> = {
  welcome: WelcomeScreen,
  purpose: PurposeScreen,
  discomfort: DiscomfortScreen,
  "lens-type": LensTypeScreen,
  thickness: ThicknessScreen,
  coating: CoatingScreen,
  result: ResultScreen,
  staff: StaffScreen,
};

// Spoken labels for the aria-live region and the screen container's
// aria-label. These mirror the visible eyebrow/heading per screen but
// stay self-contained so the announcement still works while the new
// screen is mid-transition (and its h1 has not yet been read).
const SCREEN_LABELS: Record<ScreenId, string> = {
  welcome: "환영 화면",
  purpose: "1단계: 사용 목적 선택",
  discomfort: "2단계: 불편 포인트 선택",
  "lens-type": "3단계: 렌즈 타입 선택",
  thickness: "4단계: 두께 비교",
  coating: "5단계: 코팅 옵션",
  result: "결과 안내",
  staff: "직원 안내 화면",
};

const PROGRESS_STEPS: ProgressStep<ScreenId>[] = [
  { id: "purpose", label: "사용 목적" },
  { id: "discomfort", label: "불편 포인트" },
  { id: "lens-type", label: "렌즈 타입" },
  { id: "thickness", label: "두께 비교" },
  { id: "coating", label: "코팅" },
  { id: "result", label: "결과" },
];

export default function Page() {
  // Manual rehydrate so SSR markup and client first render agree.
  // The store is configured with skipHydration; this effect runs the
  // restore after first paint, producing a one-time jump to the
  // resumed screen for users returning within the 24h TTL window.
  useEffect(() => {
    useWizard.persist.rehydrate();
  }, []);

  const screen = useWizard((s) => s.screen);
  const direction = useWizard((s) => s.direction);
  const next = useWizard((s) => s.next);
  const prev = useWizard((s) => s.prev);
  const purposes = useWizard((s) => s.purposes);
  const discomforts = useWizard((s) => s.discomforts);

  useKioskGuards({ screen, welcomeScreen: "welcome", prev });

  const ActiveScreen = SCREENS[screen];

  const { containerRef: setScreenContainer, announcement } =
    useScreenChangeA11y(screen, SCREEN_LABELS);

  // Footer behavior per screen
  const footer = (() => {
    switch (screen) {
      case "welcome":
        return null;
      case "purpose":
        return {
          primary: { label: "다음", onClick: next, disabled: purposes.length === 0 },
          secondary: { label: "이전", onClick: prev },
        };
      case "discomfort":
        return {
          primary: { label: "다음", onClick: next, disabled: discomforts.length === 0 },
          secondary: { label: "이전", onClick: prev },
        };
      case "lens-type":
      case "thickness":
      case "coating":
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
        title="내게 맞는 렌즈 찾기"
      />
    );

  return (
    // reducedMotion="user" makes all Framer Motion components honor the
    // OS-level prefers-reduced-motion setting. Transforms (slide/scale)
    // are skipped while opacity still fades — the WCAG-recommended
    // behavior for vestibular safety. Tailwind CSS animations
    // (animate-pulse, transition-*) are handled separately in globals.css.
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
