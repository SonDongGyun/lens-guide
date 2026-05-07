"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { KioskCanvas } from "./KioskCanvas";
import {
  COATING_Y,
  LEFT_X,
  LENS_H,
  LENS_W,
  PAINT_Y,
  RIGHT_X,
  SPARK_LIFE,
  type Spark,
  type Stroke,
} from "./scratch/types";
import { drawScratches, drawSparks } from "./scratch/painter";
import { useScratchTextures } from "./scratch/useScratchTextures";
import { useScratchPointer } from "./scratch/useScratchPointer";

// Side-by-side eyeglass scratch lab. Two real lens silhouettes — the
// uncoated lens on the left accumulates real grooves; the coated lens
// on the right answers each touch with a green shield burst.
//
// Pointer events are wired *directly* to the canvas DOM element instead
// of via R3F's mesh-event picker. Earlier iterations used an invisible
// picker plane with onPointerDown/Move handlers, but R3F's internal
// pointer-capture state could end up wedged after a gesture on one lens
// (the third gesture in a row would silently no-op even though the first
// two worked). DOM listeners are immune to that — `pointerdown` always
// fires, `pointermove`/`pointerup` are tracked on `window` so they fire
// even when the finger leaves the canvas, and we filter by pointerId so
// multi-touch can't corrupt the active-gesture state.

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

      <KioskCanvas
        camera={{ position: [0, 5.5, 9.5], fov: 32, near: 0.1, far: 100 }}
        style={{ touchAction: "none" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 11, 7]} intensity={1.35} color="#FFFFFF" />
        <directionalLight position={[-7, 4, 5]} intensity={0.5} color="#C9D8FF" />
        <pointLight position={[0, 6, 6]} intensity={0.45} color="#FFFFFF" />

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
      </KioskCanvas>

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

      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 text-ink-500 text-[8px] sm:text-[9px] font-medium tracking-wide pointer-events-none whitespace-nowrap">
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

  useScratchPointer({
    strokesRef,
    sparksRef,
    onScratchStart,
    onProtectStart,
  });

  const lensShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.absellipse(0, 0, LENS_W, LENS_H, 0, Math.PI * 2, false, 0);
    return shape;
  }, []);

  // Thin rim around each lens — a touch wider than the substrate so it
  // visually grips the glass like a real spectacle frame.
  const frameShape = useMemo(() => {
    const RIM_W = 0.07;
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
      LENS_W + 0.006,
      LENS_H + 0.006,
      0,
      Math.PI * 2,
      false,
      0
    );
    outer.holes.push(inner);
    return outer;
  }, []);

  const {
    scratchCanvas,
    scratchTexture,
    sparkCanvas,
    sparkTexture,
    leftPaintGeo,
    rightPaintGeo,
  } = useScratchTextures(lensShape);

  useEffect(() => {
    strokesRef.current = [];
    sparksRef.current = [];
  }, [resetTick]);

  useFrame(() => {
    // Use performance.now() to match the clock used when spawning sparks.
    // Mixing it with R3F's clock.elapsedTime made `now - spark.bornAt`
    // start out negative (the R3F clock starts on first frame, but
    // performance.now() is anchored at navigation start). A negative age
    // produced a negative gradient radius, which throws IndexSizeError
    // from createRadialGradient and silently stalls the entire useFrame
    // loop — that was killing all canvas updates after the first spark.
    const now = performance.now() / 1000;
    sparksRef.current = sparksRef.current.filter(
      (s) => now - s.bornAt < SPARK_LIFE
    );

    if (drawScratches(scratchCanvas, strokesRef.current)) {
      scratchTexture.needsUpdate = true;
    }
    if (drawSparks(sparkCanvas, sparksRef.current, now)) {
      sparkTexture.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Frames — thin elliptical rim around each lens */}
      <Frame x={LEFT_X} shape={frameShape} />
      <Frame x={RIGHT_X} shape={frameShape} />

      {/* Bridge — slim metal nose-piece tying the two rims together so
          the pair reads as a real pair of glasses, not two floating disks. */}
      <Bridge />

      {/* Substrates — clear glass blanks */}
      <Substrate x={LEFT_X} shape={lensShape} />
      <Substrate x={RIGHT_X} shape={lensShape} />

      {/* Paint surfaces — canvas textures with scratches / spark glow.
          renderOrder forces these to draw after the substrates so the
          texture isn't hidden by the substrate's transparent depth
          write, even if camera-distance sorting flips. */}
      <mesh
        geometry={leftPaintGeo}
        position={[LEFT_X, PAINT_Y, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        raycast={() => null}
        renderOrder={2}
      >
        <meshBasicMaterial map={scratchTexture} transparent depthWrite={false} />
      </mesh>
      <mesh
        geometry={rightPaintGeo}
        position={[RIGHT_X, PAINT_Y, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        raycast={() => null}
        renderOrder={2}
      >
        <meshBasicMaterial map={sparkTexture} transparent depthWrite={false} />
      </mesh>

      {/* Coating overlay — full ellipse, glossy iridescent */}
      <CoatingOverlay x={RIGHT_X} shape={lensShape} />
    </group>
  );
}

function Frame({ x, shape }: { x: number; shape: THREE.Shape }) {
  return (
    <mesh
      position={[x, -0.05, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      raycast={() => null}
    >
      <extrudeGeometry
        args={[
          shape,
          {
            depth: 0.32,
            curveSegments: 96,
            bevelEnabled: true,
            bevelSegments: 4,
            bevelSize: 0.02,
            bevelThickness: 0.02,
          },
        ]}
      />
      <meshPhysicalMaterial
        color="#1A2540"
        roughness={0.22}
        metalness={0.85}
        clearcoat={0.85}
        clearcoatRoughness={0.12}
      />
    </mesh>
  );
}

function Bridge() {
  // The cylinder is laid sideways so its length runs along world X. We
  // span from the right edge of the left lens to the left edge of the
  // right lens, with a touch of overlap so it tucks into each rim.
  const length = (RIGHT_X - LENS_W) - (LEFT_X + LENS_W) + 0.18;
  return (
    <mesh
      position={[0, 0.12, 0]}
      rotation={[0, 0, Math.PI / 2]}
      raycast={() => null}
    >
      <cylinderGeometry args={[0.085, 0.085, length, 24]} />
      <meshPhysicalMaterial
        color="#1A2540"
        roughness={0.22}
        metalness={0.85}
        clearcoat={0.85}
        clearcoatRoughness={0.12}
      />
    </mesh>
  );
}

function Substrate({ x, shape }: { x: number; shape: THREE.Shape }) {
  return (
    <mesh
      position={[x, -0.06, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      raycast={() => null}
    >
      <extrudeGeometry
        args={[
          shape,
          {
            depth: 0.26,
            curveSegments: 96,
            bevelEnabled: true,
            bevelSegments: 6,
            bevelSize: 0.04,
            bevelThickness: 0.04,
          },
        ]}
      />
      <meshPhysicalMaterial
        color="#F2F7FD"
        roughness={0.04}
        metalness={0}
        clearcoat={1}
        clearcoatRoughness={0.02}
        ior={1.5}
        transparent
        opacity={0.55}
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
      renderOrder={3}
    >
      <shapeGeometry args={[shape, 96]} />
      <meshPhysicalMaterial
        color="#A8B5FF"
        transparent
        opacity={0.22}
        roughness={0.04}
        metalness={0.45}
        clearcoat={1}
        clearcoatRoughness={0.05}
        iridescence={0.85}
        iridescenceIOR={1.45}
        emissive="#7B61FF"
        emissiveIntensity={0.12}
      />
    </mesh>
  );
}
