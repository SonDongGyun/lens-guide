"use client";

import { motion } from "framer-motion";
import { useWizard } from "@/lib/store";
import { INDEXES, type IndexId } from "@/lib/data";
import { SectionTitle } from "@/components/ui/ScreenShell";
import { ThicknessVisual } from "@/components/visuals/ThicknessVisual";
import { cn } from "@/lib/utils";

const RX_PRESETS = [-2, -4, -6, -8];

export function ThicknessScreen() {
  const selected = useWizard((s) => s.selectedIndex);
  const setIndex = useWizard((s) => s.setIndex);
  const prescription = useWizard((s) => s.prescription);
  const setPrescription = useWizard((s) => s.setPrescription);

  const info = INDEXES.find((i) => i.id === selected)!;

  return (
    <div className="h-full overflow-y-auto px-10 lg:px-20 pb-10">
      <div className="max-w-7xl mx-auto pt-4">
        <SectionTitle
          eyebrow="STEP 4"
          title={
            <>
              같은 도수, <span className="gradient-text">렌즈 두께</span>는 이만큼 달라져요
            </>
          }
          desc="압축률을 바꿔보면 같은 프레임에서 옆면 두께가 어떻게 변하는지 직접 확인할 수 있어요."
        />

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 mt-8 items-start">
          {/* visual */}
          <div>
            <ThicknessVisual
              index={selected}
              thicknessFactor={info.thicknessFactor}
              prescription={prescription}
            />

            {/* prescription presets */}
            <div className="mt-5 p-4 rounded-3xl bg-white border border-ink-50 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-ink-400 font-semibold">
                    내 도수 (예시)
                  </div>
                  <div className="text-lg font-bold text-ink-900 font-num">
                    {prescription.toFixed(2)}D
                  </div>
                </div>
                <div className="flex gap-2">
                  {RX_PRESETS.map((rx) => {
                    const active = prescription === rx;
                    return (
                      <button
                        key={rx}
                        onClick={() => setPrescription(rx)}
                        className={cn(
                          "px-3 py-2 rounded-xl text-sm font-semibold transition-all",
                          active
                            ? "bg-ink-900 text-white shadow-md"
                            : "bg-bg-muted text-ink-500 hover:bg-ink-50"
                        )}
                      >
                        {rx.toFixed(2)}D
                      </button>
                    );
                  })}
                </div>
              </div>
              <input
                type="range"
                min={-10}
                max={-0.5}
                step={0.25}
                value={prescription}
                onChange={(e) => setPrescription(Number(e.target.value))}
                className="w-full accent-brand h-2 mt-3"
              />
              <div className="flex justify-between text-xs text-ink-300 mt-1">
                <span>-0.50D</span>
                <span>-5.00D</span>
                <span>-10.00D</span>
              </div>
            </div>
          </div>

          {/* index buttons + summary */}
          <div className="space-y-3">
            <div className="text-xs text-ink-400 font-semibold tracking-wider uppercase mb-1">
              압축률 비교
            </div>
            {INDEXES.map((opt, i) => {
              const active = selected === opt.id;
              return (
                <motion.button
                  key={opt.id}
                  onClick={() => setIndex(opt.id as IndexId)}
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "w-full text-left p-5 rounded-3xl border transition-all duration-200 relative",
                    active
                      ? "bg-ink-900 border-ink-900 text-white shadow-elevated"
                      : "bg-white border-ink-50 hover:border-ink-100 hover:shadow-card"
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          "shrink-0 w-12 h-12 rounded-2xl grid place-items-center font-bold text-base",
                          active ? "bg-white text-ink-900" : "bg-bg-muted text-ink-700"
                        )}
                      >
                        {opt.label}
                      </div>
                      <div className="min-w-0">
                        <div
                          className={cn(
                            "font-semibold tracking-tight",
                            active ? "text-white" : "text-ink-900"
                          )}
                        >
                          {opt.summary}
                        </div>
                        <div
                          className={cn(
                            "text-xs mt-0.5",
                            active ? "text-white/60" : "text-ink-400"
                          )}
                        >
                          {opt.recommendedRange}
                        </div>
                      </div>
                    </div>
                    <PriceTier tier={opt.priceTier} active={active} />
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <Bar
                      label="얇기"
                      value={1 - opt.thicknessFactor}
                      active={active}
                    />
                    <Bar
                      label="가벼움"
                      value={1 - opt.weightFactor}
                      active={active}
                    />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function PriceTier({ tier, active }: { tier: number; active: boolean }) {
  return (
    <div className="flex items-center gap-0.5 shrink-0">
      {Array.from({ length: 4 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "text-base font-bold",
            i < tier
              ? active
                ? "text-white"
                : "text-ink-700"
              : active
                ? "text-white/20"
                : "text-ink-100"
          )}
        >
          ₩
        </span>
      ))}
    </div>
  );
}

function Bar({ label, value, active }: { label: string; value: number; active: boolean }) {
  return (
    <div className="flex-1">
      <div
        className={cn(
          "text-[10px] font-semibold uppercase tracking-wider mb-1",
          active ? "text-white/60" : "text-ink-300"
        )}
      >
        {label}
      </div>
      <div
        className={cn(
          "h-1.5 rounded-full overflow-hidden",
          active ? "bg-white/15" : "bg-ink-50"
        )}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background: active
              ? "linear-gradient(90deg, #ffffff 0%, #DBE8FE 100%)"
              : "linear-gradient(90deg, #3182F6 0%, #7B61FF 100%)",
          }}
          initial={false}
          animate={{ width: `${Math.max(8, value * 100)}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
        />
      </div>
    </div>
  );
}
