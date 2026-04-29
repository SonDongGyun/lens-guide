"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useWizard } from "@/lib/store";
import { DISCOMFORTS } from "@/lib/data";
import { SectionTitle } from "@/components/ui/ScreenShell";
import { SelectCard } from "@/components/ui/SelectCard";

export function DiscomfortScreen() {
  const discomforts = useWizard((s) => s.discomforts);
  const toggleDiscomfort = useWizard((s) => s.toggleDiscomfort);
  const primaryConcern = useWizard((s) => s.primaryConcern);
  const setPrimary = useWizard((s) => s.setPrimaryConcern);

  return (
    <div className="h-full overflow-y-auto px-10 lg:px-20 pb-10">
      <div className="max-w-6xl mx-auto pt-4">
        <SectionTitle
          eyebrow="STEP 2"
          title={
            <>
              어떤 점이 가장 <span className="gradient-text">불편</span>하신가요?
            </>
          }
          desc="해당되는 항목을 모두 선택하시고, 가장 신경 쓰이는 한 가지를 알려주세요."
        />

        <div className="grid md:grid-cols-2 gap-3 mt-10">
          {DISCOMFORTS.map((d, i) => (
            <SelectCard
              key={d.id}
              index={i}
              selected={discomforts.includes(d.id)}
              onClick={() => toggleDiscomfort(d.id)}
              emoji={d.emoji}
              label={d.label}
              desc={d.desc}
            />
          ))}
        </div>

        {/* primary concern picker */}
        <AnimatePresence>
          {discomforts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="mt-8 p-6 rounded-3xl bg-ink-900 text-white shadow-elevated"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-2xl bg-white/10 grid place-items-center">
                  <span className="text-xl">⭐</span>
                </div>
                <div className="flex-1">
                  <div className="text-xs uppercase tracking-wider text-white/60 font-semibold">
                    가장 신경쓰이는 1가지
                  </div>
                  <div className="text-lg font-semibold mt-0.5">
                    가장 우선해서 비교해드릴 항목을 골라주세요
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {discomforts.map((id) => {
                  const d = DISCOMFORTS.find((x) => x.id === id)!;
                  const active = primaryConcern === id;
                  return (
                    <motion.button
                      key={id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setPrimary(id)}
                      className={`px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all flex items-center gap-2 ${
                        active
                          ? "bg-white text-ink-900"
                          : "bg-white/10 text-white/80 hover:bg-white/15"
                      }`}
                    >
                      <span>{d.emoji}</span>
                      {d.label}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
