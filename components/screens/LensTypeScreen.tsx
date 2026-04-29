"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useWizard } from "@/lib/store";
import { LENS_TYPES, type LensTypeId } from "@/lib/data";
import { SectionTitle } from "@/components/ui/ScreenShell";
import { LensTypeVisual } from "@/components/visuals/LensTypeVisual";
import { cn } from "@/lib/utils";

const TABS: { id: LensTypeId; short: string }[] = [
  { id: "single", short: "단초점" },
  { id: "progressive", short: "누진다초점" },
  { id: "office", short: "오피스" },
];

export function LensTypeScreen() {
  const lensType = useWizard((s) => s.lensType);
  const setLensType = useWizard((s) => s.setLensType);
  const [gaze, setGaze] = useState(0.5);

  // auto demo: gentle gaze sweep, throttled to ~5fps to avoid
  // state churn during AnimatePresence transitions
  useEffect(() => {
    let frame = 0;
    const id = setInterval(() => {
      frame += 1;
      setGaze(0.5 + 0.45 * Math.sin(frame / 6));
    }, 200);
    return () => clearInterval(id);
  }, [lensType]);

  const info = LENS_TYPES[lensType];

  return (
    <div className="h-full overflow-y-auto px-10 lg:px-20 pb-10">
      <div className="max-w-7xl mx-auto pt-4">
        <SectionTitle
          eyebrow="STEP 3"
          title={
            <>
              거리별로 <span className="gradient-text">시야가 어떻게</span> 다른지 보세요
            </>
          }
          desc="아래 탭을 바꿔보면 같은 장면에서 또렷한 영역이 어떻게 달라지는지 확인할 수 있어요."
        />

        {/* Tabs */}
        <div className="mt-8 inline-flex p-1.5 rounded-2xl bg-bg-muted">
          {TABS.map((t) => {
            const active = lensType === t.id;
            return (
              <motion.button
                key={t.id}
                onClick={() => setLensType(t.id)}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "relative px-6 py-3 rounded-xl text-base font-semibold transition-colors",
                  active ? "text-ink-900" : "text-ink-400"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="lens-tab"
                    className="absolute inset-0 rounded-xl bg-white shadow-card"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative">{t.short}</span>
              </motion.button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 mt-6 items-start">
          {/* visual */}
          <div>
            <LensTypeVisual lensType={lensType} gaze={gaze} />
            <div className="mt-4 px-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-xs text-ink-400 font-semibold tracking-wider uppercase">
                  시선 이동
                </div>
                <div className="text-xs text-ink-300">
                  슬라이더를 위·아래로 옮겨 직접 비교해보세요
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={gaze * 100}
                onChange={(e) => setGaze(Number(e.target.value) / 100)}
                className="w-full accent-brand h-2"
              />
              <div className="flex justify-between text-xs text-ink-300 mt-1">
                <span>위 (먼 거리)</span>
                <span>중간거리</span>
                <span>아래 (가까움)</span>
              </div>
            </div>
          </div>

          {/* info card */}
          <motion.div
            key={info.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="p-7 rounded-3xl bg-white border border-ink-50 shadow-card"
          >
            <div className="text-sm text-brand font-bold tracking-wider uppercase">
              {info.label}
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-ink-900">
              {info.tagline}
            </div>
            <p className="mt-3 text-ink-500 leading-relaxed">{info.description}</p>

            <div className="mt-6 grid grid-cols-3 gap-2">
              {[
                { k: "near", label: "가까움", emoji: "📖" },
                { k: "mid", label: "중간", emoji: "💻" },
                { k: "far", label: "먼 거리", emoji: "🚗" },
              ].map((x) => {
                const v = (info.zones as Record<string, number>)[x.k];
                return (
                  <div
                    key={x.k}
                    className={cn(
                      "rounded-2xl p-4 text-center transition-colors",
                      v
                        ? "bg-brand-soft border border-brand/20"
                        : "bg-bg-muted border border-transparent"
                    )}
                  >
                    <div className="text-2xl">{x.emoji}</div>
                    <div className="mt-1 text-sm font-semibold text-ink-700">
                      {x.label}
                    </div>
                    <div
                      className={cn(
                        "mt-1 text-xs font-bold",
                        v ? "text-brand-dark" : "text-ink-300"
                      )}
                    >
                      {v ? "또렷" : "흐림"}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 p-4 rounded-2xl bg-bg-muted">
              <div className="text-xs uppercase tracking-wider text-ink-400 font-semibold">
                이런 분께 적합
              </div>
              <div className="mt-1 text-ink-900 font-medium">{info.bestFor}</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
