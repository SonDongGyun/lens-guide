"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export type LayerId = "surface" | "hardcoat" | "substrate";
export type ScenarioId = "wipe" | "desk" | "bag";
export type ScratchSelection =
  | { kind: "scenario"; id: ScenarioId }
  | { kind: "layer"; id: LayerId };

export const SCRATCH_LAYERS: Record<LayerId, { name: string; role: string }> = {
  surface: {
    name: "표면 외층",
    role: "가장 바깥에서 일상의 마찰을 먼저 받아내는 얇은 막입니다. 매일 닦을 때 생기는 미세한 잔기스가 가장 먼저 자리잡는 위치이기도 합니다.",
  },
  hardcoat: {
    name: "하드코트",
    role: "이 코팅의 핵심층. 표면 경도를 높여 같은 마찰·충격에서도 흠집이 덜 깊게 들어가도록 도와줍니다.",
  },
  substrate: {
    name: "렌즈 본체",
    role: "시력 교정을 담당하는 광학 본체. 본체가 직접 긁히면 시야 왜곡이 남기 때문에, 위 두 층이 마찰을 먼저 받아내도록 설계되어 있습니다.",
  },
};

export const SCRATCH_SCENARIOS: Record<
  ScenarioId,
  { label: string; layer: LayerId; body: string }
> = {
  wipe: {
    label: "안경닦이 반복",
    layer: "surface",
    body: "매일 닦으면 미세 먼지와 천 사이의 작은 마찰이 누적됩니다. 표면 외층이 이를 먼저 받아내며, 하드코트가 잔기스가 깊어지는 걸 늦춰 줍니다.",
  },
  desk: {
    label: "책상에 뒤집어 둠",
    layer: "hardcoat",
    body: "테이블의 거친 면이나 모서리에 직접 닿는 상황. 단단한 하드코트가 충격 흠집의 깊이를 줄여 본체 손상으로 이어지는 걸 막아 줍니다.",
  },
  bag: {
    label: "가방 속 마찰",
    layer: "hardcoat",
    body: "열쇠·동전 같은 단단한 물건과 무작위 방향으로 부딪힙니다. 하드코트가 받아내면서 본체까지 번지는 흠집의 깊이를 줄여 줍니다.",
  },
};

export function panelContent(selection: ScratchSelection) {
  return selection.kind === "layer"
    ? {
        tag: "레이어 역할",
        title: SCRATCH_LAYERS[selection.id].name,
        body: SCRATCH_LAYERS[selection.id].role,
      }
    : {
        tag: "일상 마찰 상황",
        title: SCRATCH_SCENARIOS[selection.id].label,
        body: SCRATCH_SCENARIOS[selection.id].body,
      };
}

// 2D fallback: SVG cross-section with the same layer-tap and scenario-chip
// interaction as the 3D version. Used when WebGL is unavailable or the
// 3D canvas throws at runtime.
export function ScratchVisual2D() {
  const [selection, setSelection] = useState<ScratchSelection>({
    kind: "scenario",
    id: "wipe",
  });

  const activeLayer: LayerId =
    selection.kind === "layer"
      ? selection.id
      : SCRATCH_SCENARIOS[selection.id].layer;

  const panel = panelContent(selection);

  return (
    <div className="relative w-full aspect-[16/10] rounded-3xl overflow-hidden border border-ink-50 shadow-card bg-gradient-to-br from-[#F5F8FC] via-white to-[#EBF1F8] select-none">
      <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full bg-ink-900 text-white text-xs font-bold tracking-wider uppercase">
        표면 경도 강화
      </div>

      <div className="absolute inset-0 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-4 lg:gap-6 px-6 sm:px-8 pt-16 pb-12">
        <div className="relative flex flex-col items-center justify-center">
          <ScratchDiagram
            activeLayer={activeLayer}
            onSelectLayer={(id) => setSelection({ kind: "layer", id })}
          />
          <div className="mt-2 text-[11px] text-ink-400 text-center">
            레이어를 탭하면 역할이 강조됩니다
          </div>
        </div>

        <div className="self-center flex flex-col">
          <div className="text-[11px] uppercase tracking-wider text-ink-400 font-semibold">
            {panel.tag}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selection.kind}-${selection.id}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="mt-1"
            >
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-ink-900 leading-tight">
                {panel.title}
              </div>
              <p className="mt-2 text-ink-500 leading-relaxed text-sm sm:text-[15px] min-h-[72px]">
                {panel.body}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-4">
            <div className="text-[11px] uppercase tracking-wider text-ink-400 font-semibold mb-2">
              상황 선택
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(SCRATCH_SCENARIOS) as ScenarioId[]).map((id) => {
                const active =
                  selection.kind === "scenario" && selection.id === id;
                return (
                  <motion.button
                    key={id}
                    type="button"
                    aria-pressed={active}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelection({ kind: "scenario", id })}
                    className={cn(
                      "min-h-[44px] px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                      active
                        ? "bg-ink-900 text-white border-ink-900"
                        : "bg-white text-ink-600 border-ink-100 hover:border-ink-300"
                    )}
                  >
                    {SCRATCH_SCENARIOS[id].label}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 max-w-[92%] px-3 py-1.5 rounded-full bg-white/85 backdrop-blur text-ink-500 text-[10px] font-medium tracking-wide text-center">
        * 스크래치를 완전히 막지는 않으며, 거친 표면이나 강한 충격에는 손상될 수 있습니다
      </div>
    </div>
  );
}

function ScratchDiagram({
  activeLayer,
  onSelectLayer,
}: {
  activeLayer: LayerId;
  onSelectLayer: (id: LayerId) => void;
}) {
  const dimSurface = activeLayer !== "surface";
  const dimHardcoat = activeLayer !== "hardcoat";
  const dimSubstrate = activeLayer !== "substrate";

  // Keyboard activation for the SVG layer pickers. Native onClick covers
  // pointer + Enter on focusable elements in some browsers, but Space
  // and a few SR-key interactions require an explicit handler. Mirroring
  // the standard button keydown behavior keeps the diagram operable
  // without a real <button>, which would force a layout we don't want.
  const handleKey =
    (id: LayerId) => (e: React.KeyboardEvent<SVGGElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelectLayer(id);
      }
    };

  return (
    <svg
      viewBox="0 0 420 280"
      className="w-full max-w-[420px] h-auto"
      role="img"
      aria-label="렌즈 단면도. 표면 외층, 하드코트, 렌즈 본체 3겹 구조."
    >
      <title>렌즈 단면도: 표면 외층 · 하드코트 · 렌즈 본체 3겹 구조</title>
      <defs>
        <linearGradient id="substrate-grad-2d" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D6E1F2" />
          <stop offset="100%" stopColor="#B8C8E0" />
        </linearGradient>
      </defs>

      <g
        role="button"
        tabIndex={0}
        aria-label={SCRATCH_LAYERS.substrate.name}
        aria-pressed={activeLayer === "substrate"}
        onClick={() => onSelectLayer("substrate")}
        onKeyDown={handleKey("substrate")}
        style={{ cursor: "pointer" }}
        className="focus:outline-none"
      >
        <rect
          x="40"
          y="118"
          width="340"
          height="110"
          rx="55"
          fill="url(#substrate-grad-2d)"
          stroke={dimSubstrate ? "#B8C8E0" : "#3D4A5C"}
          strokeWidth={dimSubstrate ? 1.2 : 2.4}
          opacity={dimSubstrate ? 0.55 : 1}
        />
      </g>

      <g
        role="button"
        tabIndex={0}
        aria-label={SCRATCH_LAYERS.hardcoat.name}
        aria-pressed={activeLayer === "hardcoat"}
        onClick={() => onSelectLayer("hardcoat")}
        onKeyDown={handleKey("hardcoat")}
        style={{ cursor: "pointer" }}
        className="focus:outline-none"
      >
        <path
          d="M40 118 Q 40 90 95 90 L 325 90 Q 380 90 380 118 Z"
          fill="#3182F6"
          opacity={dimHardcoat ? 0.42 : 0.95}
          stroke={dimHardcoat ? "transparent" : "#0C5BD6"}
          strokeWidth="2"
        />
      </g>

      <g
        role="button"
        tabIndex={0}
        aria-label={SCRATCH_LAYERS.surface.name}
        aria-pressed={activeLayer === "surface"}
        onClick={() => onSelectLayer("surface")}
        onKeyDown={handleKey("surface")}
        style={{ cursor: "pointer" }}
        className="focus:outline-none"
      >
        <rect x="40" y="68" width="340" height="26" fill="transparent" />
        <path
          d="M65 95 Q 95 80 130 80 L 290 80 Q 325 80 355 95"
          stroke={dimSurface ? "rgba(123,97,255,0.45)" : "#7B61FF"}
          strokeWidth={dimSurface ? 3 : 5}
          fill="none"
          strokeLinecap="round"
        />
      </g>

      <g fontFamily="inherit" fontSize="13" fill="#191F28">
        <line
          x1="200"
          y1="78"
          x2="240"
          y2="40"
          stroke={dimSurface ? "rgba(123,97,255,0.4)" : "#7B61FF"}
          strokeWidth={dimSurface ? 1.2 : 1.6}
        />
        <text
          x="244"
          y="38"
          fontWeight="700"
          fill={dimSurface ? "rgba(123,97,255,0.55)" : "#7B61FF"}
        >
          표면 외층
        </text>

        <line
          x1="120"
          y1="100"
          x2="60"
          y2="50"
          stroke={dimHardcoat ? "rgba(49,130,246,0.4)" : "#3182F6"}
          strokeWidth={dimHardcoat ? 1.2 : 1.6}
        />
        <text
          x="20"
          y="38"
          fontWeight="700"
          fill={dimHardcoat ? "rgba(49,130,246,0.55)" : "#3182F6"}
        >
          하드코트
        </text>
        <text
          x="20"
          y="54"
          fontSize="11"
          fill={dimHardcoat ? "rgba(78,89,104,0.55)" : "#4E5968"}
        >
          단단한 보호층
        </text>

        <line
          x1="210"
          y1="170"
          x2="240"
          y2="252"
          stroke={dimSubstrate ? "rgba(138,163,194,0.5)" : "#3D4A5C"}
          strokeWidth={dimSubstrate ? 1.2 : 1.6}
        />
        <text
          x="244"
          y="258"
          fontWeight="700"
          fill={dimSubstrate ? "rgba(78,89,104,0.55)" : "#191F28"}
        >
          렌즈 본체
        </text>
      </g>
    </svg>
  );
}
