"use client";

import dynamic from "next/dynamic";
import { use3DSupport, markUnsupported } from "@/lib/use3DSupport";
import { ThreeBoundary } from "./ThreeBoundary";
import { ScratchVisual2D } from "./ScratchVisual2D";

const ScratchVisual3D = dynamic(
  () => import("./ScratchVisual3D").then((m) => m.ScratchVisual3D),
  { ssr: false, loading: () => <Skeleton /> }
);

export function ScratchVisual() {
  const supports3D = use3DSupport();

  if (supports3D === null) return <Skeleton />;
  if (!supports3D) return <ScratchVisual2D />;

  return (
    <ThreeBoundary
      label="ScratchVisual3D"
      fallback={<ScratchVisual2D />}
      onError={markUnsupported}
    >
      <ScratchVisual3D />
    </ThreeBoundary>
  );
}

function Skeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="relative w-full aspect-[16/10] rounded-3xl overflow-hidden border border-ink-50 shadow-card bg-gradient-to-br from-[#F5F8FC] via-white to-[#EBF1F8]"
    >
      <div className="absolute inset-0 grid place-items-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-ink-100" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand animate-spin" />
          </div>
          <div className="text-ink-400 text-xs font-medium">
            스크래치 단면 불러오는 중…
          </div>
        </div>
      </div>
    </div>
  );
}
