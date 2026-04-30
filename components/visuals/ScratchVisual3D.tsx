"use client";

import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Side-by-side eyeglass scratch lab. Two real lens silhouettes — the
// uncoated lens on the left accumulates real grooves; the coated lens
// on the right answers each touch with a green shield burst. A single
// invisible picker plane handles all pointer events for both lenses,
// which avoids per-mesh pointer-capture quirks where a gesture on one
// lens could leave residual state that blocked the next gesture on
// the other lens.

interface Stroke {
  points: { x: number; y: number }[];
}
interface Spark {
  x: number;
  y: number;
  bornAt: number;
}

const TEX_W = 720;
const TEX_H = 800;
const SPARK_LIFE = 0.75;
const MAX_STROKES = 30;
const MAX_POINTS_PER_STROKE = 250;
const MIN_STROKE_STEP_PX = 3;

const LENS_W = 1.8;
const LENS_H = 2.0;
const LEFT_X = -2.1;
const RIGHT_X = 2.1;
const PAINT_Y = 0.21;
const COATING_Y = 0.27;
const PICKER_Y = 0.5;

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
        <pointLight position={[0, 8, 4]} intensity={0.55} color="#FFFFFF" />

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

      <motion.div
        animate={hasInteracted ? { opacity: 0.5 } : { opacity: 1 }}
        className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 z-10 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-ink-900/85 backdrop-blur text-white text-[10px] sm:text-[11px] font-medium whitespace-nowrap shadow-soft"
      >
        렌즈를 손가락으로 긁어보세요
      </motion.div>

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
  // Single source of truth for the active gesture. Replaces the per-lens
  // refs that used to get into a stuck state when R3F's mesh-level
  // pointer capture lingered after a release on the other lens.
  const isDownRef = useRef(false);
  const lastSideRef = useRef<"left" | "right" | null>(null);
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

  const frameShape = useMemo(() => {
    const RIM_W = 0.09;
    const outer = new THREE.Shape();
    outer.absellipse(
      0,
      0,
      LENS_W + RIM_W,
      LENS_H + RIM_W,
      0,
      Math.PI * 2,
      false,
      0
    );
    const inner = new THREE.Path();
    inner.absellipse(
      0,
      0,
      LENS_W + 0.005,
      LENS_H + 0.005,
      0,
      Math.PI * 2,
      false,
      0
    );
    outer.holes.push(inner);
    return outer;
  }, []);

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

  // Window-level cleanup: a release that lands off-canvas still ends
  // the gesture cleanly.
  useEffect(() => {
    const clear = () => {
      isDownRef.current = false;
      lastSideRef.current = null;
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

  // World coords (XZ on the picker plane) → texture coords. The picker
  // is rotated −90° around X, so local +Y maps to world −Z; that's why
  // we flip Z when computing localY.
  const worldToTex = (worldX: number, worldZ: number) => {
    const isLeft = worldX < 0;
    const lensX = isLeft ? LEFT_X : RIGHT_X;
    const localX = worldX - lensX;
    const localY = -worldZ;
    const inside =
      (localX / LENS_W) ** 2 + (localY / LENS_H) ** 2 <= 1;
    const u = (localX + LENS_W) / (LENS_W * 2);
    const v = (localY + LENS_H) / (LENS_H * 2);
    return {
      isLeft,
      inside,
      x: u * TEX_W,
      y: (1 - v) * TEX_H,
    };
  };

  const startStroke = (x: number, y: number) => {
    strokesRef.current.push({ points: [{ x, y }] });
    if (strokesRef.current.length > MAX_STROKES) {
      strokesRef.current.shift();
    }
  };

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

  const handleDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const target = e.target as Element & {
      setPointerCapture?: (id: number) => void;
    };
    target.setPointerCapture?.(e.pointerId);
    isDownRef.current = true;
    const { isLeft, inside, x, y } = worldToTex(e.point.x, e.point.z);
    if (!inside) {
      lastSideRef.current = null;
      return;
    }
    if (isLeft) {
      lastSideRef.current = "left";
      startStroke(x, y);
      onScratchStart();
    } else {
      lastSideRef.current = "right";
      tryAddSpark(x, y, performance.now() / 1000);
      onProtectStart();
    }
  };

  const handleMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDownRef.current) return;
    const { isLeft, inside, x, y } = worldToTex(e.point.x, e.point.z);
    if (!inside) {
      lastSideRef.current = null;
      return;
    }
    const curSide: "left" | "right" = isLeft ? "left" : "right";
    if (curSide !== lastSideRef.current) {
      // Crossing into a new lens silhouette (or returning from outside).
      // Treat as a fresh sub-gesture so scratch grooves don't connect
      // across the gap.
      if (curSide === "left") {
        startStroke(x, y);
        onScratchStart();
      } else {
        tryAddSpark(x, y, performance.now() / 1000);
        onProtectStart();
      }
      lastSideRef.current = curSide;
    } else if (curSide === "left") {
      pushStrokePoint(x, y);
    } else {
      tryAddSpark(x, y, performance.now() / 1000);
    }
  };

  return (
    <group>
      {/* Frames — thin elliptical rim around each lens */}
      <Frame x={LEFT_X} shape={frameShape} />
      <Frame x={RIGHT_X} shape={frameShape} />

      {/* Substrates — clear glass blanks */}
      <Substrate x={LEFT_X} shape={lensShape} />
      <Substrate x={RIGHT_X} shape={lensShape} />

      {/* Paint surfaces — canvas textures with scratches / spark glow */}
      <mesh
        geometry={leftPaintGeo}
        position={[LEFT_X, PAINT_Y, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        raycast={() => null}
      >
        <meshBasicMaterial map={scratchTexture} transparent />
      </mesh>
      <mesh
        geometry={rightPaintGeo}
        position={[RIGHT_X, PAINT_Y, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        raycast={() => null}
      >
        <meshBasicMaterial map={sparkTexture} transparent />
      </mesh>

      {/* Coating overlay — full ellipse, glossy iridescent */}
      <CoatingOverlay x={RIGHT_X} shape={lensShape} />

      {/* Single invisible picker — covers entire stage so every
          pointer event in the canvas routes through one mesh. */}
      <mesh
        position={[0, PICKER_Y, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
      >
        <planeGeometry args={[50, 30]} />
        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={false}
          colorWrite={false}
        />
      </mesh>
    </group>
  );
}

function Frame({ x, shape }: { x: number; shape: THREE.Shape }) {
  return (
    <mesh
      position={[x, -0.18, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      raycast={() => null}
    >
      <extrudeGeometry
        args={[
          shape,
          {
            depth: 0.5,
            bevelEnabled: true,
            bevelSegments: 4,
            bevelSize: 0.025,
            bevelThickness: 0.025,
          },
        ]}
      />
      <meshPhysicalMaterial
        color="#1B2540"
        roughness={0.3}
        metalness={0.75}
        clearcoat={0.7}
        clearcoatRoughness={0.18}
      />
    </mesh>
  );
}

function Substrate({ x, shape }: { x: number; shape: THREE.Shape }) {
  return (
    <mesh
      position={[x, -0.3, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      raycast={() => null}
    >
      <extrudeGeometry
        args={[
          shape,
          {
            depth: 0.5,
            bevelEnabled: true,
            bevelSegments: 6,
            bevelSize: 0.05,
            bevelThickness: 0.05,
          },
        ]}
      />
      <meshPhysicalMaterial
        color="#EAF1FB"
        roughness={0.06}
        metalness={0}
        clearcoat={1}
        clearcoatRoughness={0.04}
        ior={1.5}
        transmission={0.45}
        thickness={0.5}
        attenuationColor="#A8C5F0"
        attenuationDistance={2.2}
        transparent
        opacity={0.92}
      />
    </mesh>
  );
}

function CoatingOverlay({ x, shape }: { x: number; shape: THREE.Shape }) {
  return (
    <mesh
      position={[x, COATING_Y, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      raycast={() => null}
    >
      <shapeGeometry args={[shape]} />
      <meshPhysicalMaterial
        color="#9AAEFF"
        transparent
        opacity={0.26}
        roughness={0.04}
        metalness={0.4}
        clearcoat={1}
        clearcoatRoughness={0.06}
        iridescence={0.7}
        iridescenceIOR={1.4}
        emissive="#7B61FF"
        emissiveIntensity={0.1}
      />
    </mesh>
  );
}
