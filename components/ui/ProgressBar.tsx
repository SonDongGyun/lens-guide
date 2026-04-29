"use client";

import { motion } from "framer-motion";
import { SCREEN_ORDER, type ScreenId } from "@/lib/store";

const VISIBLE_STEPS: { id: ScreenId; label: string }[] = [
  { id: "purpose", label: "사용 목적" },
  { id: "discomfort", label: "불편 포인트" },
  { id: "lens-type", label: "렌즈 타입" },
  { id: "thickness", label: "두께 비교" },
  { id: "coating", label: "코팅" },
  { id: "result", label: "결과" },
];

interface Props {
  current: ScreenId;
}

export function ProgressBar({ current }: Props) {
  if (current === "welcome" || current === "staff") return null;

  const idx = VISIBLE_STEPS.findIndex((s) => s.id === current);
  const progress = ((idx + 1) / VISIBLE_STEPS.length) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2 sm:mb-3 gap-3">
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm min-w-0">
          <span className="font-num text-brand font-bold">{idx + 1}</span>
          <span className="text-ink-300">/ {VISIBLE_STEPS.length}</span>
          <span className="ml-1.5 sm:ml-2 text-ink-700 font-medium truncate">
            {VISIBLE_STEPS[idx]?.label}
          </span>
        </div>
        <div className="hidden sm:block text-xs text-ink-300 font-medium tracking-wider uppercase">
          내게 맞는 렌즈 찾기
        </div>
      </div>
      <div className="relative h-1.5 w-full rounded-full bg-ink-50 overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: "linear-gradient(90deg, #3182F6 0%, #7B61FF 100%)",
          }}
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 28 }}
        />
      </div>
    </div>
  );
}

export { SCREEN_ORDER };
