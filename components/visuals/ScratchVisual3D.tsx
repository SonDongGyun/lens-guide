"use client";

import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Side-by-side eyeglass scratch lab. Two real lens silhouettes — the
// uncoated lens on the left accumulates real grooves; the coated lens
// on the right answers each touch with a green shield burst. Each
// lens owns an independent canvas-backed texture so they never share
// state, and the coating overlay covers the whole right lens.

interface Stroke {
  points: { x: number; y: number }[];
}
interface Spark {
  x: number;
  y: number;
  bornAt: number;
}

// Per-lens canvas — aspect matches the lens ellipse so pixel density is
// equal in both axes.
const TEX_W = 720;
const TEX_H = 800;
const SPARK_LIFE = 0.75;
// Generous limits + auto-roll on overflow so a long sustained drag
// keeps producing visible strokes — the previous 10 strokes / 120
// points caps caused new scratches to silently disappear after a few
// seconds of dragging.
const MAX_STROKES = 30;
const MAX_POINTS_PER_STROKE = 250;
// Skip pointer-move ticks closer than this to the previous point — at
// 250+ Hz pointer rates we'd otherwise blow MAX_POINTS_PER_STROKE in
// well under a second.
const MIN_STROKE_STEP_PX = 3;

// Per-lens silhouette (half-width / half-height) and X centers for the
// left/right pair. Span ≈ -3.9 → 3.9 keeps both lenses inside the same
// camera frame as the old single slab.
const LENS_W = 1.8;
const LENS_H = 2.0;
const LEFT_X = -2.1;
const RIGHT_X = 2.1;

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
  // Single source of truth for which lens (if any) is being dragged. Per-lens
  // refs got into a stale state when a gesture started on one lens and the
  // pointer wandered: pointer capture caused R3F's leave events to misfire,
  // so the next gesture on the same lens silently no-op'd. With one ref we
  // can also clear globally on window pointerup, so a release that lands
  // outside any mesh still resets state.
  const dragSideRef = useRef<"left" | "right" | null>(null);
  const lastSparkAtRef = useRef(0);

  // Two independent canvas-backed textures — one per lens. Keeping
  // them split means the uncoated lens never has to know about sparks
  // and the coated lens never has to know about scratches.
  const {
    scratchCanvas,
    scratchTexture,
    sparkCanvas,
    sparkTexture,
  } = useMemo(() => {
    const make = () => {
      const c = document.createElement("canvas");
      c.width = TEX_W;
      c.height = TEX_H;
      const t = new THREE.CanvasTexture(c);
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      return { c, t };
    };
    const left = make();
    const right = make();
    return {
      scratchCanvas: left.c,
      scratchTexture: left.t,
      sparkCanvas: right.c,
      sparkTexture: right.t,
    };
  }, []);

  const lensShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.absellipse(0, 0, LENS_W, LENS_H, 0, Math.PI * 2, false, 0);
    return shape;
  }, []);

  // ShapeGeometry's default UVs are raw shape coordinates; remap them
  // to [0,1] across the bounding box so the canvas texture maps
  // cleanly across the ellipse. We need two independent geometry
  // instances since the two lenses use different textures.
  const buildPaintGeometry = (shape: THREE.Shape) => {
    const geo = new THREE.ShapeGeometry(shape, 64);
    const positions = geo.attributes.position;
    const uvs = geo.attributes.uv;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      uvs.setXY(i, (x + LENS_W) / (LENS_W * 2), (y + LENS_H) / (LENS_H * 2));
    }
    uvs.needsUpdate = true;
    return geo;
  };

  const leftPaintGeo = useMemo(() => buildPaintGeometry(lensShape), [lensShape]);
  const rightPaintGeo = useMemo(() => buildPaintGeometry(lensShape), [lensShape]);

  useEffect(() => {
    return () => {
      leftPaintGeo.dispose();
      rightPaintGeo.dispose();
      scratchTexture.dispose();
      sparkTexture.dispose();
    };
  }, [leftPaintGeo, rightPaintGeo, scratchTexture, sparkTexture]);

  useEffect(() => {
    strokesRef.current = [];
    sparksRef.current = [];
  }, [resetTick]);

  // Window-level cleanup: a pointerup that lands off-canvas (or off-mesh)
  // would otherwise leave dragSideRef stuck.
  useEffect(() => {
    const clear = () => {
      dragSideRef.current = null;
    };
    window.addEventListener("pointerup", clear);
    window.addEventListener("pointercancel", clear);
    return () => {
      window.removeEventListener("pointerup", clear);
      window.removeEventListener("pointercancel", clear);
    };
  }, []);

  useFrame(({ clock }) => {
    const now = clock.elapsedTime;
    sparksRef.current = sparksRef.current.filter(
      (s) => now - s.bornAt < SPARK_LIFE
    );

    // --- Left lens (scratches) ---
    const sctx = scratchCanvas.getContext("2d");
    if (sctx) {
      sctx.clearRect(0, 0, TEX_W, TEX_H);
      // faint red wash so the uncoated lens reads slightly warm even
      // before any scratches.
      sctx.fillStyle = "rgba(252,165,165,0.07)";
      sctx.fillRect(0, 0, TEX_W, TEX_H);

      sctx.lineCap = "round";
      sctx.lineJoin = "round";
      for (const stroke of strokesRef.current) {
        if (stroke.points.length < 1) continue;
        sctx.strokeStyle = "rgba(20,28,46,0.85)";
        sctx.lineWidth = 2.6;
        sctx.beginPath();
        stroke.points.forEach((p, i) => {
          if (i === 0) sctx.moveTo(p.x, p.y);
          else sctx.lineTo(p.x, p.y);
        });
        sctx.stroke();
        // bright sliver above the groove for a cut-glass feel
        sctx.strokeStyle = "rgba(255,255,255,0.45)";
        sctx.lineWidth = 0.8;
        sctx.beginPath();
        stroke.points.forEach((p, i) => {
          if (i === 0) sctx.moveTo(p.x - 0.8, p.y - 0.8);
          else sctx.lineTo(p.x - 0.8, p.y - 0.8);
        });
        sctx.stroke();
      }
      scratchTexture.needsUpdate = true;
    }

    // --- Right lens (sparks/shield) ---
    const pctx = sparkCanvas.getContext("2d");
    if (pctx) {
      pctx.clearRect(0, 0, TEX_W, TEX_H);
      pctx.fillStyle = "rgba(110,231,183,0.07)";
      pctx.fillRect(0, 0, TEX_W, TEX_H);

      for (const spark of sparksRef.current) {
        const age = (now - spark.bornAt) / SPARK_LIFE;
        const alpha = 1 - age;
        const radius = 18 + age * 30;

        const grad = pctx.createRadialGradient(
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
        pctx.fillStyle = grad;
        pctx.fillRect(
          spark.x - radius,
          spark.y - radius,
          radius * 2,
          radius * 2
        );

        pctx.strokeStyle = `rgba(34,197,94,${alpha * 0.7})`;
        pctx.lineWidth = 2;
        pctx.beginPath();
        pctx.arc(spark.x, spark.y, radius * 0.85, 0, Math.PI * 2);
        pctx.stroke();

        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2 + age * 4;
          const r = radius * (0.6 + age * 0.5);
          const sx = spark.x + Math.cos(angle) * r;
          const sy = spark.y + Math.sin(angle) * r;
          pctx.fillStyle = `rgba(255,255,255,${alpha * 0.9})`;
          pctx.beginPath();
          pctx.arc(sx, sy, 1.6, 0, Math.PI * 2);
          pctx.fill();
        }
      }
      sparkTexture.needsUpdate = true;
    }
  });

  const uvToTex = (uv: THREE.Vector2) => ({
    x: uv.x * TEX_W,
    y: (1 - uv.y) * TEX_H,
  });

  // Push the next stroke point — but skip ones that haven't moved far
  // enough, and auto-roll into a new stroke when the current one fills
  // up. Without this, sustained drags either burn through the point
  // budget in a fraction of a second or freeze silently.
  const pushStrokePoint = (x: number, y: number) => {
    const cur = strokesRef.current[strokesRef.current.length - 1];
    if (!cur) return;
    const last = cur.points[cur.points.length - 1];
    if (last) {
      const dx = x - last.x;
      const dy = y - last.y;
      if (dx * dx + dy * dy < MIN_STROKE_STEP_PX * MIN_STROKE_STEP_PX) return;
    }
    if (cur.points.length >= MAX_POINTS_PER_STROKE) {
      strokesRef.current.push({ points: [{ x, y }] });
      if (strokesRef.current.length > MAX_STROKES) {
        strokesRef.current.shift();
      }
    } else {
      cur.points.push({ x, y });
    }
  };

  const tryAddSpark = (x: number, y: number, now: number) => {
    if (now - lastSparkAtRef.current < 0.045) return;
    lastSparkAtRef.current = now;
    sparksRef.current.push({ x, y, bornAt: now });
  };

  const capturePointer = (e: ThreeEvent<PointerEvent>) => {
    const target = e.target as Element & {
      setPointerCapture?: (id: number) => void;
    };
    target.setPointerCapture?.(e.pointerId);
  };

  return (
    <group>
      {/* LEFT LENS — uncoated, accumulates real scratches */}
      <group position={[LEFT_X, 0, 0]}>
        <mesh position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <extrudeGeometry
            args={[lensShape, { depth: 0.5, bevelEnabled: false }]}
          />
          <meshPhysicalMaterial
            color="#D6E5F5"
            roughness={0.12}
            metalness={0.02}
            clearcoat={0.7}
            clearcoatRoughness={0.18}
            transparent
            opacity={0.92}
          />
        </mesh>
        <mesh
          geometry={leftPaintGeo}
          position={[0, 0.21, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          onPointerDown={(e: ThreeEvent<PointerEvent>) => {
            if (!e.uv) return;
            e.stopPropagation();
            capturePointer(e);
            const { x, y } = uvToTex(e.uv);
            dragSideRef.current = "left";
            strokesRef.current.push({ points: [{ x, y }] });
            if (strokesRef.current.length > MAX_STROKES) {
              strokesRef.current.shift();
            }
            onScratchStart();
          }}
          onPointerMove={(e: ThreeEvent<PointerEvent>) => {
            if (dragSideRef.current !== "left" || !e.uv) return;
            const { x, y } = uvToTex(e.uv);
            pushStrokePoint(x, y);
          }}
        >
          <meshBasicMaterial map={scratchTexture} transparent />
        </mesh>
      </group>

      {/* RIGHT LENS — coated, sparks instead of scratches */}
      <group position={[RIGHT_X, 0, 0]}>
        <mesh position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <extrudeGeometry
            args={[lensShape, { depth: 0.5, bevelEnabled: false }]}
          />
          <meshPhysicalMaterial
            color="#D6E5F5"
            roughness={0.12}
            metalness={0.02}
            clearcoat={0.7}
            clearcoatRoughness={0.18}
            transparent
            opacity={0.92}
          />
        </mesh>
        <mesh
          geometry={rightPaintGeo}
          position={[0, 0.21, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          onPointerDown={(e: ThreeEvent<PointerEvent>) => {
            if (!e.uv) return;
            e.stopPropagation();
            capturePointer(e);
            const { x, y } = uvToTex(e.uv);
            dragSideRef.current = "right";
            tryAddSpark(x, y, performance.now() / 1000);
            onProtectStart();
          }}
          onPointerMove={(e: ThreeEvent<PointerEvent>) => {
            if (dragSideRef.current !== "right" || !e.uv) return;
            const { x, y } = uvToTex(e.uv);
            tryAddSpark(x, y, performance.now() / 1000);
          }}
        >
          <meshBasicMaterial map={sparkTexture} transparent />
        </mesh>
        {/* Coating overlay — full ellipse, glossy violet */}
        <mesh
          position={[0, 0.27, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          raycast={() => null}
        >
          <shapeGeometry args={[lensShape]} />
          <meshPhysicalMaterial
            color="#7B61FF"
            transparent
            opacity={0.22}
            roughness={0.05}
            metalness={0.35}
            clearcoat={0.9}
            clearcoatRoughness={0.08}
            emissive="#7B61FF"
            emissiveIntensity={0.1}
          />
        </mesh>
      </group>
    </group>
  );
}
