"use client";

import { Component, useEffect, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { detectWebGL } from "@/lib/webgl";
import { ScratchVisual2D } from "./ScratchVisual2D";

const ScratchVisual3D = dynamic(
  () => import("./ScratchVisual3D").then((m) => m.ScratchVisual3D),
  { ssr: false, loading: () => <Skeleton /> }
);

let cachedSupports3D: boolean | null = null;

export function ScratchVisual() {
  const [supports3D, setSupports3D] = useState<boolean | null>(
    () => cachedSupports3D
  );

  useEffect(() => {
    if (cachedSupports3D === null) {
      const detected = detectWebGL();
      cachedSupports3D = detected;
      setSupports3D(detected);
    }
  }, []);

  if (supports3D === null) return <Skeleton />;
  if (!supports3D) return <ScratchVisual2D />;

  return (
    <ThreeBoundary
      fallback={<ScratchVisual2D />}
      onError={() => {
        cachedSupports3D = false;
        setSupports3D(false);
      }}
    >
      <ScratchVisual3D />
    </ThreeBoundary>
  );
}

function Skeleton() {
  return (
    <div className="relative w-full aspect-[16/10] rounded-3xl overflow-hidden border border-ink-50 shadow-card bg-gradient-to-br from-[#F5F8FC] via-white to-[#EBF1F8]">
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

class ThreeBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; onError?: () => void },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    if (typeof console !== "undefined") {
      console.warn("ScratchVisual3D failed, falling back to 2D:", error);
    }
    this.props.onError?.();
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
