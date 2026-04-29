"use client";

import { Component, useEffect, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { IndexId } from "@/lib/data";
import { detectWebGL } from "@/lib/webgl";
import { ThicknessVisual2D } from "./ThicknessVisual2D";

interface Props {
  index: IndexId;
  thicknessFactor: number;
  prescription: number;
}

const ThicknessVisual3D = dynamic(
  () => import("./ThicknessVisual3D").then((m) => m.ThicknessVisual3D),
  { ssr: false, loading: () => <Skeleton /> }
);

export function ThicknessVisual(props: Props) {
  const [supports3D, setSupports3D] = useState<boolean | null>(null);

  useEffect(() => {
    setSupports3D(detectWebGL());
  }, []);

  if (supports3D === null) return <Skeleton />;
  if (!supports3D) return <ThicknessVisual2D {...props} />;

  return (
    <ThreeBoundary fallback={<ThicknessVisual2D {...props} />}>
      <ThicknessVisual3D {...props} />
    </ThreeBoundary>
  );
}

function Skeleton() {
  return (
    <div className="w-full aspect-[16/10] rounded-3xl bg-gradient-to-br from-[#1A2240] via-[#0F1428] to-[#0D1320] shadow-card relative overflow-hidden border border-ink-100">
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(123,97,255,0.18), transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(49,130,246,0.20), transparent 60%)",
        }}
      />
      <div className="absolute inset-0 grid place-items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-2 border-white/10" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white/70 animate-spin" />
          </div>
          <div className="text-white/75 text-sm font-medium tracking-tight">
            3D 두께 비교 불러오는 중…
          </div>
        </div>
      </div>
    </div>
  );
}

class ThreeBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    if (typeof console !== "undefined") {
      console.warn("ThicknessVisual3D failed, falling back to 2D:", error);
    }
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
