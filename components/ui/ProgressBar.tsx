"use client";

import { motion } from "framer-motion";

export interface ProgressStep<K extends string = string> {
  id: K;
  label: string;
}

interface Props<K extends string = string> {
  steps: ProgressStep<K>[];
  current: K;
  // Right-side label shown next to the bar on >=sm screens. Lets each
  // wizard brand its progress (e.g. "내게 맞는 렌즈 찾기" vs
  // "내게 맞는 콘택트 찾기") without coupling the bar to a specific store.
  title?: string;
}

export function ProgressBar<K extends string = string>({
  steps,
  current,
  title,
}: Props<K>) {
  const idx = steps.findIndex((s) => s.id === current);
  if (idx < 0) return null;
  const progress = ((idx + 1) / steps.length) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2 sm:mb-3 gap-3">
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm min-w-0">
          <span className="font-num text-brand font-bold">{idx + 1}</span>
          <span className="text-ink-400">/ {steps.length}</span>
          <span className="ml-1.5 sm:ml-2 text-ink-700 font-medium truncate">
            {steps[idx]?.label}
          </span>
        </div>
        {title && (
          <div className="hidden sm:block text-xs text-ink-400 font-medium tracking-wider uppercase">
            {title}
          </div>
        )}
      </div>
      <div
        role="progressbar"
        aria-label="진행 단계"
        aria-valuenow={idx + 1}
        aria-valuemin={1}
        aria-valuemax={steps.length}
        className="relative h-1.5 w-full rounded-full bg-ink-50 overflow-hidden"
      >
        <motion.div
          aria-hidden="true"
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
