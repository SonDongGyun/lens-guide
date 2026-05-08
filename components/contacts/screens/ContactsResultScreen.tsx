"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useContactsWizard } from "@/lib/contacts/store";
import {
  WEAR_PATTERNS,
  CORRECTION_TYPES,
  CONTACT_DISCOMFORTS,
  COSMETIC_EFFECTS,
  MATERIALS,
  REPLACEMENTS,
} from "@/lib/contacts/data";
import { recommendContacts } from "@/lib/contacts/recommendation";
import { SectionTitle } from "@/components/ui/ScreenShell";
import { BCFitInteractive } from "@/components/contacts/visuals/BCFitInteractive";

export function ContactsResultScreen() {
  const wearPattern = useContactsWizard((s) => s.wearPattern);
  const correctionType = useContactsWizard((s) => s.correctionType);
  const discomforts = useContactsWizard((s) => s.discomforts);
  const primaryDiscomfort = useContactsWizard((s) => s.primaryDiscomfort);
  const selectedMaterial = useContactsWizard((s) => s.selectedMaterial);
  const selectedReplacement = useContactsWizard((s) => s.selectedReplacement);
  const cosmeticEffect = useContactsWizard((s) => s.cosmeticEffect);

  const rec = useMemo(
    () =>
      recommendContacts({
        wearPattern,
        correctionType,
        discomforts,
        primaryDiscomfort,
      }),
    [wearPattern, correctionType, discomforts, primaryDiscomfort]
  );

  const material = MATERIALS[selectedMaterial ?? rec.material];
  const replacement = REPLACEMENTS[selectedReplacement ?? rec.replacement];
  const cosmetic = COSMETIC_EFFECTS[cosmeticEffect];
  const wear = wearPattern
    ? WEAR_PATTERNS.find((p) => p.id === wearPattern)
    : null;
  const correction = correctionType
    ? CORRECTION_TYPES.find((c) => c.id === correctionType)
    : null;

  const brief = `${material.label} · ${replacement.label} · ${cosmetic.label}`;

  return (
    <div className="h-full overflow-y-auto overscroll-contain px-4 sm:px-8 lg:px-20 pb-8 sm:pb-10">
      <div className="max-w-6xl mx-auto pt-4">
        <SectionTitle
          eyebrow="MY CONTACTS"
          title={
            <>
              입력하신 내용 기반 <span className="gradient-text">콘택트 비교 안내</span>
            </>
          }
          desc="선택값을 정리한 참고용 안내입니다. 정확한 BC·DIA·도수와 실착용 적합성은 매장 검안 후 결정돼요."
        />

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
                aria-hidden="true"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="shrink-0 w-12 h-12 sm:w-20 sm:h-20 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(219,232,254,0.7) 50%, rgba(123,97,255,0.7))",
                  boxShadow:
                    "0 20px 40px rgba(0,0,0,0.2), inset 0 0 20px rgba(255,255,255,0.5)",
                }}
              />
            </div>

            <div className="mt-5 sm:mt-8 grid sm:grid-cols-3 gap-3 sm:gap-4">
              <Highlight
                label="재질"
                value={material.label}
                sub={material.tagline}
              />
              <Highlight
                label="교체 주기"
                value={replacement.label}
                sub={replacement.tagline}
              />
              <Highlight
                label="시각 효과"
                value={cosmetic.label}
                sub={cosmetic.desc}
              />
            </div>
          </div>
        </motion.div>

        {rec.notes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-5 sm:mt-6 p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-white border border-ink-50 shadow-card"
          >
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div
                aria-hidden="true"
                className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-brand-soft text-brand grid place-items-center"
              >
                💡
              </div>
              <div className="min-w-0">
                <div className="text-[11px] sm:text-xs uppercase tracking-wider text-ink-400 font-semibold">
                  알아두시면 좋은 점
                </div>
                <div className="text-sm sm:text-lg font-bold text-ink-900 leading-snug">
                  선택하신 조합 관련 안내예요
                </div>
              </div>
            </div>
            <ul className="space-y-2.5 sm:space-y-3">
              {rec.notes.map((n, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex gap-3 items-start"
                >
                  <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-brand" />
                  <span className="text-sm sm:text-base text-ink-700 leading-relaxed">
                    {n}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-5 sm:mt-6 p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-white border border-ink-50 shadow-card"
        >
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <div
              aria-hidden="true"
              className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-brand-soft text-brand grid place-items-center"
            >
              👁
            </div>
            <div className="min-w-0">
              <div className="text-[11px] sm:text-xs uppercase tracking-wider text-ink-400 font-semibold">
                왜 매장 측정이 필요한가요?
              </div>
              <div className="text-sm sm:text-lg font-bold text-ink-900 leading-snug">
                BC 슬라이더로 직접 만져보세요
              </div>
            </div>
          </div>
          <BCFitInteractive />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-5 sm:mt-6 p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-ink-900 text-white shadow-elevated"
        >
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <div
              aria-hidden="true"
              className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/10 grid place-items-center"
            >
              📋
            </div>
            <div className="min-w-0">
              <div className="text-[11px] sm:text-xs uppercase tracking-wider text-white/60 font-semibold">
                매장 방문 시 체크리스트
              </div>
              <div className="text-sm sm:text-lg font-bold leading-snug">
                직원이 함께 측정·확인해드려요
              </div>
            </div>
          </div>
          <ul className="space-y-2 sm:space-y-2.5">
            {rec.visitChecklist.map((c, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span
                  aria-hidden="true"
                  className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-white/10 grid place-items-center text-[10px] font-bold"
                >
                  {i + 1}
                </span>
                <span className="text-sm sm:text-base text-white/85 leading-relaxed">
                  {c}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        <div className="mt-5 sm:mt-6 grid sm:grid-cols-2 gap-3 sm:gap-4">
          <SummarySection
            emoji="🕓"
            title="착용 패턴 / 교정"
            chips={[wear?.label, correction?.label].filter(
              (x): x is string => Boolean(x)
            )}
          />
          <SummarySection
            emoji="💢"
            title="현재 불편"
            chips={discomforts.map(
              (id) =>
                CONTACT_DISCOMFORTS.find((d) => d.id === id)?.label ?? id
            )}
            primary={
              primaryDiscomfort
                ? CONTACT_DISCOMFORTS.find((d) => d.id === primaryDiscomfort)
                    ?.label
                : undefined
            }
          />
        </div>

        <div className="mt-5 sm:mt-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-bg-muted text-[11px] sm:text-xs text-ink-400 leading-relaxed">
          * 본 안내는 룰 기반 비교 도구로, 입력하신 선택을 정리해 보여드리는 참고용 자료입니다. 시력 검사·렌즈 처방을 대체하지 않으며, 실제 콘택트 결정은 매장 검안과 직원 상담 후 이루어집니다.
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
      <div className="mt-0.5 sm:mt-1 text-lg sm:text-2xl font-bold tracking-tight">
        {value}
      </div>
      <div className="mt-0.5 sm:mt-1 text-[11px] sm:text-xs text-white/70 line-clamp-2">
        {sub}
      </div>
    </div>
  );
}

function SummarySection({
  emoji,
  title,
  chips,
  primary,
}: {
  emoji: string;
  title: string;
  chips: string[];
  primary?: string;
}) {
  return (
    <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-ink-50 shadow-soft">
      <div className="flex items-center gap-2 mb-2 sm:mb-3">
        <span aria-hidden="true" className="text-base sm:text-xl">
          {emoji}
        </span>
        <span className="text-[11px] sm:text-xs font-bold tracking-wider uppercase text-ink-400">
          {title}
        </span>
      </div>
      {chips.length === 0 ? (
        <div className="text-xs sm:text-sm text-ink-400">선택 없음</div>
      ) : (
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {chips.map((c) => {
            const isPrimary = primary && c === primary;
            return (
              <span
                key={c}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold ${
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
