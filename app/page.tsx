"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useWizard, type ScreenId } from "@/lib/store";
import { KioskFrame } from "@/components/ui/KioskFrame";
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

export default function Page() {
  const screen = useWizard((s) => s.screen);
  const direction = useWizard((s) => s.direction);
  const next = useWizard((s) => s.next);
  const prev = useWizard((s) => s.prev);
  const purposes = useWizard((s) => s.purposes);
  const discomforts = useWizard((s) => s.discomforts);
  const reset = useWizard((s) => s.reset);

  // Auto-reset back to welcome after staying on staff for a while (kiosk style)
  useEffect(() => {
    if (screen !== "staff") return;
    const id = setTimeout(() => reset(), 1000 * 60 * 2);
    return () => clearTimeout(id);
  }, [screen, reset]);

  const ActiveScreen = SCREENS[screen];

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

  return (
    <KioskFrame primary={footer?.primary} secondary={footer?.secondary}>
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.div
          key={screen}
          initial={{ opacity: 0, x: direction === 1 ? 32 : -32 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction === 1 ? -32 : 32 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <ActiveScreen />
        </motion.div>
      </AnimatePresence>
    </KioskFrame>
  );
}
