"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SelectCardProps {
  selected: boolean;
  onClick: () => void;
  emoji?: string;
  label: string;
  desc?: string;
  className?: string;
  index?: number;
}

export function SelectCard({
  selected,
  onClick,
  emoji,
  label,
  desc,
  className,
  index = 0,
}: SelectCardProps) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 200, damping: 22 }}
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -3 }}
      className={cn(
        "group relative text-left p-6 rounded-3xl border transition-all duration-200",
        "flex items-start gap-4 w-full",
        selected
          ? "bg-brand-soft border-brand shadow-[0_12px_32px_rgba(49,130,246,0.18)]"
          : "bg-white border-ink-50 hover:border-ink-100 hover:shadow-card",
        className
      )}
    >
      {emoji && (
        <div
          className={cn(
            "shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-colors",
            selected ? "bg-white" : "bg-bg-muted"
          )}
        >
          {emoji}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            "text-lg font-semibold tracking-tight",
            selected ? "text-brand-dark" : "text-ink-900"
          )}
        >
          {label}
        </div>
        {desc && (
          <div
            className={cn(
              "text-sm mt-1",
              selected ? "text-brand-dark/70" : "text-ink-400"
            )}
          >
            {desc}
          </div>
        )}
      </div>
      <motion.div
        animate={{
          scale: selected ? 1 : 0.6,
          opacity: selected ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        className="shrink-0 w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 7l3.5 3.5L12 4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>
    </motion.button>
  );
}
