"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useContactsWizard } from "@/lib/contacts/store";

export function WelcomeContactsScreen() {
  const next = useContactsWizard((s) => s.next);

  return (
    <div className="absolute inset-0 grid grid-cols-1 lg:grid-cols-2">
      {/* Left: copy */}
      <div className="relative flex flex-col justify-between px-5 sm:px-8 py-10 sm:py-12 lg:py-16 lg:pl-20 lg:pr-10 z-10">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 flex-wrap"
          >
            <div
              aria-hidden="true"
              className="w-9 h-9 rounded-2xl bg-ink-900 text-white grid place-items-center font-bold"
            >
              L
            </div>
            <span className="font-bold tracking-tight text-ink-900 text-lg">
              LensGuide
            </span>
            <span className="ml-3 px-2.5 py-0.5 rounded-full bg-bg-muted text-xs font-semibold text-ink-500">
              콘택트
            </span>
            <Link
              href="/"
              className="ml-auto px-3 py-1.5 rounded-full bg-white border border-ink-50 hover:border-brand hover:text-brand text-xs font-semibold text-ink-700 transition-colors flex items-center gap-1.5 min-h-[36px]"
            >
              <span aria-hidden="true">👓</span>
              안경도 알아보기
              <svg
                aria-hidden="true"
                width="12"
                height="12"
                viewBox="0 0 14 14"
                fill="none"
              >
                <path
                  d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
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
            2분 콘택트 안내
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-[40px] sm:text-display md:text-display-lg lg:text-display-xl tracking-tight leading-[1.08] sm:leading-[1.05] text-ink-900 font-bold"
          >
            내 눈에 맞는 콘택트,
            <br />
            <span className="gradient-text">재질·주기</span>부터 골라봐요.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-ink-500 max-w-xl text-balance"
          >
            착용 패턴과 평소 불편함만 알려주시면, 산소투과도·교체주기·관리 부담의 차이를 직접 비교해보실 수 있어요.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-7 sm:mt-10 flex flex-wrap items-center gap-3"
          >
            <Button
              variant="dark"
              size="lg"
              className="sm:h-16 sm:px-10 sm:text-xl sm:rounded-3xl"
              onClick={next}
            >
              지금 시작하기
              <svg
                aria-hidden="true"
                className="ml-2"
                width="20"
                height="20"
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
            <div className="text-xs sm:text-sm text-ink-400 sm:ml-2">
              개인정보 입력 없음 · 약 2분
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="text-xs text-ink-400 flex flex-wrap gap-x-4 gap-y-1"
        >
          <span>* 시력 검사·렌즈 처방을 대체하지 않습니다.</span>
          <span>* 매장 방문 시 BC·도수 측정이 필요합니다.</span>
        </motion.div>
      </div>

      {/* Right: hero space — placeholder until visual phase lands */}
      <div className="relative overflow-hidden hidden lg:block bg-gradient-to-br from-bg-muted via-white to-brand-soft" />
    </div>
  );
}
