"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useWizard } from "@/lib/store";
import { HeroLens } from "@/components/visuals/HeroLens";
import type { PurposeId, DiscomfortId } from "@/lib/data";

const QUICK_ENTRIES: {
  label: string;
  emoji: string;
  purposes?: PurposeId[];
  discomforts?: DiscomfortId[];
}[] = [
  { label: "다초점이 궁금해요", emoji: "👓", purposes: ["progressive_curious"] },
  { label: "렌즈가 너무 두꺼워요", emoji: "📏", discomforts: ["thickness"] },
  {
    label: "야간 운전이 불편해요",
    emoji: "🌙",
    purposes: ["driving"],
    discomforts: ["night_glare"],
  },
  {
    label: "블루라이트 차단이 필요할까요?",
    emoji: "💻",
    purposes: ["screen"],
    discomforts: ["eye_fatigue"],
  },
];

export function WelcomeScreen() {
  const next = useWizard((s) => s.next);
  const togglePurpose = useWizard((s) => s.togglePurpose);
  const toggleDiscomfort = useWizard((s) => s.toggleDiscomfort);

  const startWith = (entry: (typeof QUICK_ENTRIES)[number]) => {
    entry.purposes?.forEach(togglePurpose);
    entry.discomforts?.forEach(toggleDiscomfort);
    next();
  };

  return (
    <div className="absolute inset-0 grid grid-cols-1 lg:grid-cols-2">
      {/* Left: copy */}
      <div className="relative flex flex-col justify-between px-5 sm:px-8 py-10 sm:py-12 lg:py-16 lg:pl-20 lg:pr-10 z-10">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2"
          >
            <div className="w-9 h-9 rounded-2xl bg-ink-900 text-white grid place-items-center font-bold">
              L
            </div>
            <span className="font-bold tracking-tight text-ink-900 text-lg">
              LensGuide
            </span>
            <span className="ml-3 px-2.5 py-0.5 rounded-full bg-bg-muted text-xs font-semibold text-ink-500">
              매장 안내
            </span>
          </motion.div>
        </div>

        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-soft text-brand text-xs font-semibold tracking-wider uppercase mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            1분 안내
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-display-lg lg:text-display-xl tracking-tight leading-[1.05] text-ink-900"
          >
            나에게 맞는 렌즈,
            <br />
            <span className="gradient-text">눈으로</span> 비교해보세요.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="mt-6 text-xl text-ink-500 max-w-xl text-balance"
          >
            사용 목적과 평소 불편함만 알려주시면, 렌즈 종류 · 두께 · 코팅의 차이를 직접 비교해볼 수 있는 인터랙티브 안내예요.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-10 flex items-center gap-3"
          >
            <Button variant="dark" size="xl" onClick={next}>
              지금 시작하기
              <svg
                className="ml-2"
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
              >
                <path
                  d="M5 11h12m0 0l-5-5m5 5l-5 5"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
            <div className="text-sm text-ink-400 ml-2">
              개인정보 입력 없음 · 평균 1분 30초
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mt-10 flex flex-wrap gap-2"
          >
            {QUICK_ENTRIES.map((q, i) => (
              <motion.button
                key={q.label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.95 + i * 0.05 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => startWith(q)}
                className="px-4 py-2.5 rounded-2xl bg-white border border-ink-50 hover:border-ink-100 hover:shadow-card transition-all flex items-center gap-2 text-sm font-medium text-ink-700"
              >
                <span>{q.emoji}</span>
                {q.label}
              </motion.button>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="text-xs text-ink-300 flex gap-4"
        >
          <span>* 시력 검사를 대체하지 않습니다.</span>
          <span>* 결과는 직원 상담 자료로 사용됩니다.</span>
        </motion.div>
      </div>

      {/* Right: hero visual */}
      <div className="relative overflow-hidden hidden lg:block">
        <HeroLens />
      </div>
    </div>
  );
}
