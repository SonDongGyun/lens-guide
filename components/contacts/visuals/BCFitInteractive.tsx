"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";
import { use3DSupport, markUnsupported } from "@/lib/use3DSupport";
import { ThreeBoundary } from "@/components/visuals/ThreeBoundary";
import { cn } from "@/lib/utils";

// Lightweight wrapper around the BC-fit 3D scene. Three.js / r3f is
// pulled in via next/dynamic so /contacts stays cheap on first paint;
// the scene chunk only downloads when this component mounts (i.e.
// when the user reaches the result step). When WebGL is missing or
// the scene throws, we fall through to a tiny SVG illustration that
// communicates the same three-state story without a GPU.

const BCFit3D = dynamic(
  () => import("./BCFit3D").then((m) => m.BCFit3D),
  { ssr: false, loading: () => <Skeleton /> }
);

export function BCFitInteractive() {
  const reduced = useReducedMotion();
  const supports3D = use3DSupport();

  if (reduced) return <BCFitStatic />;
  if (supports3D === null) return <Skeleton />;
  if (!supports3D) return <BCFitStatic />;

  return (
    <ThreeBoundary
      label="BCFit3D"
      fallback={<BCFitStatic />}
      onError={markUnsupported}
    >
      <BCFit3D />
    </ThreeBoundary>
  );
}

function Skeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="w-full aspect-[16/10] rounded-3xl bg-gradient-to-br from-[#0E1628] via-[#101a36] to-[#1a1230] shadow-card relative overflow-hidden border border-ink-100"
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(123,97,255,0.20), transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(49,130,246,0.22), transparent 60%)",
        }}
      />
      <div className="absolute inset-0 grid place-items-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-white/10" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white/70 animate-spin" />
          </div>
          <div className="text-white/75 text-xs sm:text-sm font-medium tracking-tight">
            BC 핏 인터랙션 불러오는 중…
          </div>
        </div>
      </div>
    </div>
  );
}

function BCFitStatic() {
  return (
    <div className="rounded-3xl bg-bg-muted/60 p-4 sm:p-6">
      <div className="text-sm sm:text-base text-ink-700 leading-relaxed">
        너무 가파른 BC는 렌즈가 각막에 흡착돼 눈물 순환을 막고, 너무 평평한 BC는
        가장자리가 들떠 미끄러져요. 매장에서 정확히 측정한 BC로 자기 눈에 맞춰야
        가장 편안합니다.
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 sm:gap-4">
        <StaticCase
          tone="steep"
          title="너무 가파름"
          subtitle="흡착 · 충혈"
          lensPath="M 8 28 Q 30 8 52 28"
          corneaPath="M 4 30 Q 30 14 56 30"
        />
        <StaticCase
          tone="good"
          title="잘 맞음"
          subtitle="자연스러운 흐름"
          lensPath="M 6 28 Q 30 12 54 28"
          corneaPath="M 4 30 Q 30 14 56 30"
        />
        <StaticCase
          tone="flat"
          title="너무 평평함"
          subtitle="가장자리 들뜸"
          lensPath="M 4 22 Q 30 12 56 22"
          corneaPath="M 4 30 Q 30 14 56 30"
        />
      </div>
    </div>
  );
}

function StaticCase({
  tone,
  title,
  subtitle,
  lensPath,
  corneaPath,
}: {
  tone: "good" | "flat" | "steep";
  title: string;
  subtitle: string;
  lensPath: string;
  corneaPath: string;
}) {
  const lensColor =
    tone === "good" ? "#3182F6" : tone === "steep" ? "#FF6B6B" : "#FF8A00";
  const titleColor =
    tone === "good"
      ? "text-brand"
      : tone === "steep"
        ? "text-accent-coral"
        : "text-accent-amber";
  return (
    <div className="rounded-2xl bg-white p-3 sm:p-4 border border-ink-50">
      <svg viewBox="0 0 60 36" className="w-full h-auto" aria-hidden="true">
        <path
          d={corneaPath}
          stroke="#D1D6DB"
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={lensPath}
          stroke={lensColor}
          strokeWidth={2.2}
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      <div className={cn("mt-1.5 text-xs sm:text-sm font-bold", titleColor)}>
        {title}
      </div>
      <div className="text-[10px] sm:text-xs text-ink-400 mt-0.5">
        {subtitle}
      </div>
    </div>
  );
}
