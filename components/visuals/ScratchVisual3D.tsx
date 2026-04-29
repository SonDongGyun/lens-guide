"use client";

import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Drag-to-scratch lab. Left half is uncoated and accumulates real grooves;
// right half is coated and answers each touch with a green shield burst.
// All stroke + spark state lives on a 2-D canvas bound as a CanvasTexture
// to the lens top, so we never rebuild Three.js geometry per pointer move.

interface Stroke {
  points: { x: number; y: number }[];
}
interface Spark {
  x: number;
  y: number;
  bornAt: number;
}

const TEX_W = 1024;
const TEX_H = 640;
const SPARK_LIFE = 0.75;
const MAX_STROKES = 10;
const MAX_POINTS_PER_STROKE = 120;

export function ScratchVisual3D() {
  const [scratchCount, setScratchCount] = useState(0);
  const [protectCount, setProtectCount] = useState(0);
  const [resetTick, setResetTick] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  const reset = () => {
    setScratchCount(0);
    setProtectCount(0);
    setResetTick((t) => t + 1);
    setHasInteracted(false);
  };

  return (
    <div
      className="relative w-full aspect-[16/10] rounded-3xl overflow-hidden border border-ink-50 shadow-card bg-gradient-to-br from-[#F5F8FC] via-white to-[#EBF1F8] select-none touch-none"
      style={{ touchAction: "none" }}
    >
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-10 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-ink-900 text-white text-[10px] sm:text-xs font-bold tracking-wider uppercase">
        스크래치 보호 체험
      </div>

      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10 flex gap-1.5 sm:gap-2">
        <Counter label="비코팅 긁힘" value={scratchCount} variant="bad" />
        <Counter label="코팅 보호" value={protectCount} variant="good" />
      </div>

      <Canvas
        camera={{ position: [0, 5.5, 9.5], fov: 32, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent", touchAction: "none" }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[10, 12, 8]} intensity={1.0} color="#FFFFFF" />
        <directionalLight position={[-8, 4, -6]} intensity={0.42} color="#9DB6FF" />

        <Lens
          resetTick={resetTick}
          onScratchStart={() => {
            setScratchCount((c) => c + 1);
            setHasInteracted(true);
          }}
          onProtectStart={() => {
            setProtectCount((c) => c + 1);
            setHasInteracted(true);
          }}
        />
      </Canvas>

      {/* split labels */}
      <div className="absolute bottom-12 sm:bottom-14 left-0 right-0 z-10 pointer-events-none flex">
        <div className="flex-1 text-center">
          <div className="inline-block px-2.5 py-1 rounded-full bg-rose-500/95 text-white text-[10px] sm:text-xs font-bold backdrop-blur shadow-soft">
            ✕ 비코팅 면
          </div>
        </div>
        <div className="flex-1 text-center">
          <div className="inline-block px-2.5 py-1 rounded-full bg-emerald-500/95 text-white text-[10px] sm:text-xs font-bold backdrop-blur shadow-soft">
            ✓ 코팅 면
          </div>
        </div>
      </div>

      {/* hint pill — bottom-left */}
      <motion.div
        animate={hasInteracted ? { opacity: 0.5 } : { opacity: 1 }}
        className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 z-10 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-ink-900/85 backdrop-blur text-white text-[10px] sm:text-[11px] font-medium whitespace-nowrap shadow-soft"
      >
        렌즈를 손가락으로 긁어보세요
      </motion.div>

      {/* reset — bottom-right (separated from hint to avoid mobile row wrap) */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={reset}
        className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 z-10 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white border border-ink-100 text-ink-600 text-[10px] sm:text-[11px] font-semibold shadow-soft"
      >
        초기화
      </motion.button>

      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 text-ink-300 text-[8px] sm:text-[9px] font-medium tracking-wide pointer-events-none whitespace-nowrap">
        * 강한 마찰엔 손상될 수 있어요
      </div>
    </div>
  );
}

function Counter({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant: "good" | "bad";
}) {
  return (
    <motion.div
      key={value}
      initial={{ scale: 1.05 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 18 }}
      className={cn(
        "px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl backdrop-blur text-right",
        variant === "bad"
          ? "bg-rose-500/15 text-rose-700 border border-rose-200"
          : "bg-emerald-500/15 text-emerald-700 border border-emerald-200"
      )}
    >
      <div className="text-[8px] sm:text-[9px] uppercase tracking-wider opacity-80 font-semibold">
        {label}
      </div>
      <div className="text-sm sm:text-base font-bold font-num leading-none mt-0.5">
        {value}
      </div>
    </motion.div>
  );
}

function Lens({
  resetTick,
  onScratchStart,
  onProtectStart,
}: {
  resetTick: number;
  onScratchStart: () => void;
  onProtectStart: () => void;
}) {
  const strokesRef = useRef<Stroke[]>([]);
  const sparksRef = useRef<Spark[]>([]);
  const isDraggingRef = useRef(false);
  const lastSideRef = useRef<"uncoated" | "coated" | null>(null);
  const lastSparkAtRef = useRef(0);

  const { canvasEl, texture } = useMemo(() => {
    const canvasEl = document.createElement("canvas");
    canvasEl.width = TEX_W;
    canvasEl.height = TEX_H;
    const texture = new THREE.CanvasTexture(canvasEl);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return { canvasEl, texture };
  }, []);

  useEffect(() => {
    strokesRef.current = [];
    sparksRef.current = [];
  }, [resetTick]);

  useEffect(() => {
    return () => {
      texture.dispose();
    };
  }, [texture]);

  useFrame(({ clock }) => {
    const now = clock.elapsedTime;
    sparksRef.current = sparksRef.current.filter(
      (s) => now - s.bornAt < SPARK_LIFE
    );

    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, TEX_W, TEX_H);

    // Side tints — barely-there so the eye reads "two zones" without
    // overpowering the lens material itself.
    ctx.fillStyle = "rgba(252,165,165,0.10)";
    ctx.fillRect(0, 0, TEX_W / 2, TEX_H);
    ctx.fillStyle = "rgba(110,231,183,0.10)";
    ctx.fillRect(TEX_W / 2, 0, TEX_W / 2, TEX_H);

    // Dashed centerline divider
    ctx.strokeStyle = "rgba(40,50,80,0.22)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([12, 10]);
    ctx.beginPath();
    ctx.moveTo(TEX_W / 2, 0);
    ctx.lineTo(TEX_W / 2, TEX_H);
    ctx.stroke();
    ctx.setLineDash([]);

    // Permanent scratches on the uncoated half
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const stroke of strokesRef.current) {
      if (stroke.points.length < 1) continue;
      // dark groove
      ctx.strokeStyle = "rgba(20,28,46,0.85)";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      stroke.points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
      // bright sliver above the groove for a cut-glass feel
      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      stroke.points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x - 0.8, p.y - 0.8);
        else ctx.lineTo(p.x - 0.8, p.y - 0.8);
      });
      ctx.stroke();
    }

    // Sparks + shield rings on the coated half
    for (const spark of sparksRef.current) {
      const age = (now - spark.bornAt) / SPARK_LIFE;
      const alpha = 1 - age;
      const radius = 16 + age * 26;

      const grad = ctx.createRadialGradient(
        spark.x,
        spark.y,
        0,
        spark.x,
        spark.y,
        radius
      );
      grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
      grad.addColorStop(0.35, `rgba(167,243,208,${alpha * 0.7})`);
      grad.addColorStop(1, "rgba(167,243,208,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(
        spark.x - radius,
        spark.y - radius,
        radius * 2,
        radius * 2
      );

      ctx.strokeStyle = `rgba(34,197,94,${alpha * 0.7})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(spark.x, spark.y, radius * 0.85, 0, Math.PI * 2);
      ctx.stroke();

      // tiny sparkle dots
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + age * 4;
        const r = radius * (0.6 + age * 0.5);
        const sx = spark.x + Math.cos(angle) * r;
        const sy = spark.y + Math.sin(angle) * r;
        ctx.fillStyle = `rgba(255,255,255,${alpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    texture.needsUpdate = true;
  });

  const uvToCanvas = (
    uv: THREE.Vector2
  ): { x: number; y: number; side: "uncoated" | "coated" } => {
    const x = uv.x * TEX_W;
    const y = (1 - uv.y) * TEX_H;
    const side: "uncoated" | "coated" = uv.x < 0.5 ? "uncoated" : "coated";
    return { x, y, side };
  };

  const tryAddSpark = (x: number, y: number, now: number) => {
    if (now - lastSparkAtRef.current < 0.045) return;
    lastSparkAtRef.current = now;
    sparksRef.current.push({ x, y, bornAt: now });
  };

  return (
    <group>
      {/* substrate body — gives the slab thickness */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[8, 0.5, 5]} />
        <meshStandardMaterial
          color="#A6BFE2"
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* paintable top face */}
      <mesh
        position={[0, 0.21, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={(e: ThreeEvent<PointerEvent>) => {
          if (!e.uv) return;
          e.stopPropagation();
          const target = e.target as Element & {
            setPointerCapture?: (id: number) => void;
          };
          target.setPointerCapture?.(e.pointerId);
          const { x, y, side } = uvToCanvas(e.uv);
          isDraggingRef.current = true;
          lastSideRef.current = side;
          const now = performance.now() / 1000;
          if (side === "uncoated") {
            strokesRef.current.push({ points: [{ x, y }] });
            if (strokesRef.current.length > MAX_STROKES) {
              strokesRef.current.shift();
            }
            onScratchStart();
          } else {
            tryAddSpark(x, y, now);
            onProtectStart();
          }
        }}
        onPointerMove={(e: ThreeEvent<PointerEvent>) => {
          if (!isDraggingRef.current || !e.uv) return;
          const { x, y, side } = uvToCanvas(e.uv);
          const now = performance.now() / 1000;

          if (side === "uncoated") {
            if (lastSideRef.current !== "uncoated") {
              strokesRef.current.push({ points: [{ x, y }] });
              if (strokesRef.current.length > MAX_STROKES) {
                strokesRef.current.shift();
              }
            } else {
              const cur = strokesRef.current[strokesRef.current.length - 1];
              if (cur && cur.points.length < MAX_POINTS_PER_STROKE) {
                cur.points.push({ x, y });
              }
            }
            lastSideRef.current = "uncoated";
          } else {
            tryAddSpark(x, y, now);
            lastSideRef.current = "coated";
          }
        }}
        onPointerUp={() => {
          isDraggingRef.current = false;
          lastSideRef.current = null;
        }}
        onPointerLeave={() => {
          isDraggingRef.current = false;
          lastSideRef.current = null;
        }}
      >
        <planeGeometry args={[8, 5]} />
        <meshBasicMaterial map={texture} transparent />
      </mesh>

      {/* coated half — glossy violet plate above the right side */}
      <mesh
        position={[2, 0.27, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        raycast={() => null}
      >
        <planeGeometry args={[4, 5]} />
        <meshStandardMaterial
          color="#7B61FF"
          transparent
          opacity={0.18}
          roughness={0.05}
          metalness={0.45}
          emissive="#7B61FF"
          emissiveIntensity={0.06}
        />
      </mesh>
    </group>
  );
}
