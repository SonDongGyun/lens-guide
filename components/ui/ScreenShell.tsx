"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionTitleProps {
  eyebrow?: string;
  title: string | React.ReactNode;
  desc?: string;
  align?: "left" | "center";
}

export function SectionTitle({
  eyebrow,
  title,
  desc,
  align = "left",
}: SectionTitleProps) {
  return (
    <div className={cn(align === "center" && "text-center")}>
      {eyebrow && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-brand bg-brand-soft px-3 py-1.5 rounded-full mb-3 sm:mb-4"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
          {eyebrow}
        </motion.div>
      )}
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="text-[26px] leading-[1.2] sm:text-headline md:text-display text-ink-900 text-balance tracking-tight font-bold"
      >
        {title}
      </motion.h1>
      {desc && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.5 }}
          className="mt-2 sm:mt-3 text-sm sm:text-lg text-ink-500 max-w-2xl text-balance"
        >
          {desc}
        </motion.p>
      )}
    </div>
  );
}
