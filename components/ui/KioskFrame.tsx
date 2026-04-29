"use client";

import { motion } from "framer-motion";
import { Button } from "./Button";
import { ProgressBar } from "./ProgressBar";
import { useWizard } from "@/lib/store";

interface Props {
  children: React.ReactNode;
  showFooter?: boolean;
  primary?: { label: string; onClick: () => void; disabled?: boolean };
  secondary?: { label: string; onClick: () => void };
}

export function KioskFrame({ children, showFooter = true, primary, secondary }: Props) {
  const screen = useWizard((s) => s.screen);

  return (
    <div className="h-dvh w-screen flex flex-col overflow-hidden">
      {/* TOP: progress */}
      {screen !== "welcome" && screen !== "staff" && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-10 pt-8 pb-4"
        >
          <ProgressBar current={screen} />
        </motion.div>
      )}

      {/* MAIN */}
      <div className="flex-1 relative overflow-hidden">{children}</div>

      {/* FOOTER */}
      {showFooter && (primary || secondary) && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="px-10 py-6 bg-white/70 backdrop-blur-xl border-t border-ink-50 flex items-center justify-between gap-4"
        >
          <div>
            {secondary && (
              <Button variant="ghost" size="lg" onClick={secondary.onClick}>
                {secondary.label}
              </Button>
            )}
          </div>
          {primary && (
            <Button
              variant="dark"
              size="lg"
              onClick={primary.onClick}
              disabled={primary.disabled}
            >
              {primary.label}
              <svg
                className="ml-2"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M5 10h10m0 0l-4-4m4 4l-4 4"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
}
