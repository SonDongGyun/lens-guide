"use client";

import { motion } from "framer-motion";
import { useWizard } from "@/lib/store";
import {
  recommend,
  buildSelectionBrief,
  LENS_LABEL,
  COATING_LABEL,
} from "@/lib/recommendation";
import { PURPOSES, DISCOMFORTS, INDEXES, LENS_TYPES } from "@/lib/data";
import { SectionTitle } from "@/components/ui/ScreenShell";
import { useMemo } from "react";

export function ResultScreen() {
  const purposes = useWizard((s) => s.purposes);
  const discomforts = useWizard((s) => s.discomforts);
  const primaryConcern = useWizard((s) => s.primaryConcern);
  const prescription = useWizard((s) => s.prescription);
  const lensType = useWizard((s) => s.lensType);
  const selectedIndex = useWizard((s) => s.selectedIndex);
  const coatings = useWizard((s) => s.coatings);

  const rec = useMemo(
    () => recommend({ purposes, discomforts, primaryConcern, prescription }),
    [purposes, discomforts, primaryConcern, prescription]
  );

  const indexInfo = INDEXES.find((i) => i.id === selectedIndex)!;
  const lensInfo = LENS_TYPES[lensType];
  const brief = buildSelectionBrief(lensType, selectedIndex, coatings);

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-8 lg:px-20 pb-8 sm:pb-10">
      <div className="max-w-6xl mx-auto pt-4">
        <SectionTitle
          eyebrow="MY LENS"
          title={
            <>
              입력하신 내용 기반 <span className="gradient-text">렌즈 비교 안내</span>
            </>
          }
          desc="선택값을 정리한 참고용 안내입니다. 정확한 처방과 상담은 직원이 이어서 도와드려요."
        />

        {/* hero recommendation card */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-6 sm:mt-8 overflow-hidden rounded-3xl sm:rounded-[32px] p-5 sm:p-8 lg:p-10 text-white"
          style={{
            background:
              "linear-gradient(135deg, #1B64DA 0%, #3182F6 50%, #7B61FF 100%)",
          }}
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-50"
            style={{
              background:
                "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.25), transparent 60%)",
            }}
          />
          <div className="relative">
            <div className="flex items-start sm:items-center justify-between gap-4 sm:gap-6 flex-wrap">
              <div className="min-w-0 flex-1">
                <div className="text-[11px] sm:text-xs font-bold tracking-wider uppercase text-white/70">
                  내가 고른 구성
                </div>
                <div className="mt-1 text-xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
                  {brief}
                </div>
              </div>
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="shrink-0 w-12 h-12 sm:w-20 sm:h-20 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(219,232,254,0.7) 50%, rgba(123,97,255,0.7))",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.2), inset 0 0 20px rgba(255,255,255,0.5)",
                }}
              />
            </div>

            <div className="mt-5 sm:mt-8 grid sm:grid-cols-3 gap-3 sm:gap-4">
              <Highlight
                label="렌즈 타입"
                value={LENS_LABEL[lensType]}
                sub={lensInfo.tagline}
              />
              <Highlight
                label="압축률"
                value={selectedIndex}
                sub={indexInfo.summary}
              />
              <Highlight
                label="기능 옵션"
                value={`${coatings.length}개`}
                sub={
                  coatings.length > 0
                    ? coatings.map((c) => COATING_LABEL[c]).join(" + ")
                    : "선택한 코팅이 없어요"
                }
              />
            </div>
          </div>
        </motion.div>

        {/* reasons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-5 sm:mt-6 p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-white border border-ink-50 shadow-card"
        >
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <div className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-brand-soft text-brand grid place-items-center">
              💡
            </div>
            <div className="min-w-0">
              <div className="text-[11px] sm:text-xs uppercase tracking-wider text-ink-400 font-semibold">
                이렇게 정리한 이유
              </div>
              <div className="text-sm sm:text-lg font-bold text-ink-900 leading-snug">
                고객님 선택을 토대로 안내드린 근거예요
              </div>
            </div>
          </div>
          <ul className="space-y-2.5 sm:space-y-3">
            {rec.reasons.map((r, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="flex gap-3 items-start"
              >
                <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-brand" />
                <span className="text-sm sm:text-base text-ink-700 leading-relaxed">{r}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* mobile: single combined card with stacked rows */}
        <div className="sm:hidden mt-5 p-4 rounded-2xl bg-white border border-ink-50 shadow-soft">
          <CompactRow
            emoji="🎯"
            title="사용 환경"
            chips={purposes.map(
              (id) => PURPOSES.find((p) => p.id === id)?.label ?? id
            )}
            empty="선택 없음"
          />
          <div className="my-3 h-px bg-ink-50" />
          <CompactRow
            emoji="💢"
            title="현재 불편"
            chips={discomforts.map(
              (id) => DISCOMFORTS.find((d) => d.id === id)?.label ?? id
            )}
            empty="선택 없음"
            primary={
              primaryConcern
                ? DISCOMFORTS.find((d) => d.id === primaryConcern)?.label
                : undefined
            }
          />
        </div>

        {/* sm+: 2-column summary grid */}
        <div className="hidden sm:grid md:grid-cols-2 gap-4 mt-6">
          <SummaryCard title="사용 환경" emoji="🎯">
            <ChipRow
              chips={purposes.map(
                (id) => PURPOSES.find((p) => p.id === id)?.label ?? id
              )}
              empty="선택 없음"
            />
          </SummaryCard>
          <SummaryCard title="현재 불편" emoji="💢">
            <ChipRow
              chips={discomforts.map(
                (id) => DISCOMFORTS.find((d) => d.id === id)?.label ?? id
              )}
              empty="선택 없음"
              primary={
                primaryConcern
                  ? DISCOMFORTS.find((d) => d.id === primaryConcern)?.label
                  : undefined
              }
            />
          </SummaryCard>
        </div>

        {/* disclaimer */}
        <div className="mt-5 sm:mt-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-bg-muted text-[11px] sm:text-xs text-ink-400 leading-relaxed">
          * 본 안내는 룰 기반 비교 도구로, 입력하신 선택을 정리해 보여드리는 참고용 자료입니다. 시력 검사를 대체하지 않으며, 실제 처방·렌즈 결정은 매장 검안과 직원 상담 후 이루어집니다.
        </div>
      </div>
    </div>
  );
}

function Highlight({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md p-3.5 sm:p-5 border border-white/15">
      <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white/70">
        {label}
      </div>
      <div className="mt-0.5 sm:mt-1 text-lg sm:text-2xl font-bold tracking-tight">{value}</div>
      <div className="mt-0.5 sm:mt-1 text-[11px] sm:text-xs text-white/70 line-clamp-2">{sub}</div>
    </div>
  );
}

function SummaryCard({
  title,
  emoji,
  children,
}: {
  title: string;
  emoji: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-ink-50 shadow-soft">
      <div className="flex items-center gap-2 mb-2.5 sm:mb-3">
        <span className="text-lg sm:text-xl">{emoji}</span>
        <span className="text-[11px] sm:text-xs font-bold tracking-wider uppercase text-ink-400">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

function ChipRow({
  chips,
  empty,
  primary,
}: {
  chips: string[];
  empty: string;
  primary?: string;
}) {
  if (chips.length === 0)
    return <div className="text-sm text-ink-300">{empty}</div>;
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((c) => {
        const isPrimary = primary && c === primary;
        return (
          <span
            key={c}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
              isPrimary
                ? "bg-ink-900 text-white"
                : "bg-bg-muted text-ink-700"
            }`}
          >
            {isPrimary && "⭐ "}
            {c}
          </span>
        );
      })}
    </div>
  );
}

function CompactRow({
  emoji,
  title,
  chips,
  empty,
  primary,
}: {
  emoji: string;
  title: string;
  chips: string[];
  empty: string;
  primary?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-sm">{emoji}</span>
        <span className="text-[10px] font-bold tracking-wider uppercase text-ink-400">
          {title}
        </span>
      </div>
      {chips.length === 0 ? (
        <div className="text-xs text-ink-300">{empty}</div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {chips.map((c) => {
            const isPrimary = primary && c === primary;
            return (
              <span
                key={c}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  isPrimary
                    ? "bg-ink-900 text-white"
                    : "bg-bg-muted text-ink-700"
                }`}
              >
                {isPrimary && "⭐ "}
                {c}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
