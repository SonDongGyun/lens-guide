"use client";

import { useMemo } from "react";
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

const SINGLE_TARGETS: { id: "far" | "near"; label: string; sub: string }[] = [
  { id: "far", label: "원거리용", sub: "운전·TV 등 먼 거리 위주" },
  { id: "near", label: "근거리용", sub: "책·세밀 작업 위주" },
];

export function LensTypeScreen() {
  const lensType = useWizard((s) => s.lensType);
  const setLensType = useWizard((s) => s.setLensType);
  const singleTarget = useWizard((s) => s.singleTarget);
  const setSingleTarget = useWizard((s) => s.setSingleTarget);

  const info = LENS_TYPES[lensType];

  const effectiveZones = useMemo(() => {
    if (lensType === "single") {
      return singleTarget === "near"
        ? { near: 1, mid: 0, far: 0 }
        : { near: 0, mid: 0, far: 1 };
    }
    return info.zones;
  }, [lensType, singleTarget, info.zones]);

  return (
    <div className="h-full overflow-y-auto px-10 lg:px-20 pb-10">
      <div className="max-w-7xl mx-auto pt-4">
        <SectionTitle
          eyebrow="STEP 3"
          title={
            <>
              <span className="gradient-text">생활 장면별로</span> 어떻게 보이는지 비교해보세요
            </>
          }
          desc="책·모니터·운전 시야 세 장면에서 각 렌즈가 어디까지 또렷한지 한눈에 보여드려요."
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

        {/* Single-vision target toggle */}
        {lensType === "single" && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            <div className="text-xs text-ink-400 font-semibold tracking-wider uppercase mb-2">
              어떤 거리에 맞춘 단초점인가요?
            </div>
            <div className="inline-flex p-1.5 rounded-2xl bg-white border border-ink-100">
              {SINGLE_TARGETS.map((t) => {
                const active = singleTarget === t.id;
                return (
                  <motion.button
                    key={t.id}
                    onClick={() => setSingleTarget(t.id)}
                    whileTap={{ scale: 0.97 }}
                    className={cn(
                      "relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left",
                      active ? "text-ink-900" : "text-ink-400"
                    )}
                  >
                    {active && (
                      <motion.div
                        layoutId="single-target-tab"
                        className="absolute inset-0 rounded-xl bg-bg-muted"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative block">{t.label}</span>
                    <span className="relative block text-[11px] font-medium text-ink-400">
                      {t.sub}
                    </span>
                  </motion.button>
                );
              })}
            </div>
            <div className="text-xs text-ink-400 mt-2 max-w-md">
              단초점은 한 거리에 맞춰 제작됩니다. 어느 거리용이 우선인지는 매장에서 함께 정해요.
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 mt-6 items-start">
          {/* visual */}
          <LensTypeVisual lensType={lensType} singleTarget={singleTarget} />

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

            {lensType === "office" && (
              <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
                먼 거리용으로는 맞지 않으니, 운전 등 외부 활동이 잦으면 누진과 비교해보세요.
              </div>
            )}

            <div className="mt-6 grid grid-cols-3 gap-2">
              {[
                { k: "near", label: "책 읽기", emoji: "📖" },
                { k: "mid", label: "모니터", emoji: "💻" },
                { k: "far", label: "운전·먼 거리", emoji: "🚗" },
              ].map((x) => {
                const v = (effectiveZones as Record<string, number>)[x.k];
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
                      {v ? "편함" : "흐림"}
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
