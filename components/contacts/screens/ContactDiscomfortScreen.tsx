"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useContactsWizard } from "@/lib/contacts/store";
import { CONTACT_DISCOMFORTS } from "@/lib/contacts/data";
import { SectionTitle } from "@/components/ui/ScreenShell";
import { SelectCard } from "@/components/ui/SelectCard";

export function ContactDiscomfortScreen() {
  const discomforts = useContactsWizard((s) => s.discomforts);
  const toggleDiscomfort = useContactsWizard((s) => s.toggleDiscomfort);
  const primary = useContactsWizard((s) => s.primaryDiscomfort);
  const setPrimary = useContactsWizard((s) => s.setPrimaryDiscomfort);

  return (
    <div className="h-full overflow-y-auto overscroll-contain px-4 sm:px-8 lg:px-20 pb-8 sm:pb-10">
      <div className="max-w-6xl mx-auto pt-4">
        <SectionTitle
          eyebrow="STEP 3"
          title={
            <>
              착용 중 어떤 점이 가장 <span className="gradient-text">불편</span>한가요?
            </>
          }
          desc="해당되는 항목을 모두 선택하시고, 가장 신경 쓰이는 한 가지를 알려주세요. 없으시면 그대로 다음으로 넘어가셔도 돼요."
        />

        <div className="grid md:grid-cols-2 gap-2.5 sm:gap-3 mt-6 sm:mt-10">
          {CONTACT_DISCOMFORTS.map((d, i) => (
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

        <AnimatePresence>
          {discomforts.length > 0 && (
            <motion.div
              role="region"
              aria-label="가장 신경쓰이는 항목 선택"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="mt-5 sm:mt-8 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-ink-900 text-white shadow-elevated"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div
                  aria-hidden="true"
                  className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/10 grid place-items-center"
                >
                  <span className="text-lg sm:text-xl">⭐</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] sm:text-xs uppercase tracking-wider text-white/60 font-semibold">
                    가장 신경쓰이는 1가지
                  </div>
                  <div className="text-sm sm:text-lg font-semibold mt-0.5 leading-snug">
                    매장에서도 이 부분을 가장 우선해서 안내드릴게요
                  </div>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2">
                {discomforts.map((id) => {
                  const d = CONTACT_DISCOMFORTS.find((x) => x.id === id)!;
                  const active = primary === id;
                  return (
                    <motion.button
                      key={id}
                      type="button"
                      aria-pressed={active}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setPrimary(id)}
                      className={`min-h-[44px] px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 sm:gap-2 ${
                        active
                          ? "bg-white text-ink-900"
                          : "bg-white/10 text-white/80 hover:bg-white/15"
                      }`}
                    >
                      <span aria-hidden="true">{d.emoji}</span>
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
