"use client";

import { useFrame, useThree } from "@react-three/fiber";
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
  MAX_POINTS_PER_STROKE,
  MAX_STROKES,
  MIN_STROKE_STEP_PX,
  PAINT_Y,
  RIGHT_X,
  SPARK_LIFE,
  TEX_H,
  TEX_W,
  type Spark,
  type Stroke,
} from "./scratch/types";

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
  const { camera, gl } = useThree();
  const strokesRef = useRef<Stroke[]>([]);
  const sparksRef = useRef<Spark[]>([]);
  const isDownRef = useRef(false);
  const lastSideRef = useRef<"left" | "right" | null>(null);
  const lastSparkAtRef = useRef(0);
  // Tracks the active touch's pointerId so a second finger can't corrupt
  // the gesture mid-scratch. null = no active gesture.
  const activePointerIdRef = useRef<number | null>(null);

  // Stash the parent callbacks in refs so the DOM event listeners below
  // never go stale across re-renders. The parent passes inline arrows
  // every render, but we only attach listeners once.
  const onScratchStartRef = useRef(onScratchStart);
  const onProtectStartRef = useRef(onProtectStart);
  useEffect(() => {
    onScratchStartRef.current = onScratchStart;
    onProtectStartRef.current = onProtectStart;
  });

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

  // DOM-level pointer plumbing. We intentionally bypass R3F's mesh-event
  // picker because the previous picker-plane approach got stuck after a
  // gesture-on-coated → gesture-on-uncoated sequence (the third gesture
  // would silently no-op while the first two worked). DOM events on the
  // canvas + window are immune to that class of bug.
  useEffect(() => {
    const canvas = gl.domElement;

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
        if (dx * dx + dy * dy < MIN_STROKE_STEP_PX * MIN_STROKE_STEP_PX)
          return;
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

    // Cast a screen-space pointer onto the *visible* lens plane (y =
    // PAINT_Y). Using the lens plane (not the picker plane) eliminates
    // parallax — the hit point lands exactly where the user perceives
    // the lens surface, regardless of camera angle.
    const screenToLens = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return null;
      const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -(((clientY - rect.top) / rect.height) * 2 - 1);
      const v = new THREE.Vector3(ndcX, ndcY, 0.5).unproject(camera);
      const dir = v.sub(camera.position).normalize();
      if (Math.abs(dir.y) < 1e-6) return null;
      const t = (PAINT_Y - camera.position.y) / dir.y;
      if (t < 0) return null;
      return {
        worldX: camera.position.x + t * dir.x,
        worldZ: camera.position.z + t * dir.z,
      };
    };

    const worldToTex = (worldX: number, worldZ: number) => {
      const isLeft = worldX < 0;
      const lensX = isLeft ? LEFT_X : RIGHT_X;
      const localX = worldX - lensX;
      const localY = -worldZ;
      const inside =
        (localX / LENS_W) ** 2 + (localY / LENS_H) ** 2 <= 1;
      const u = (localX + LENS_W) / (LENS_W * 2);
      const v = (localY + LENS_H) / (LENS_H * 2);
      return { isLeft, inside, x: u * TEX_W, y: (1 - v) * TEX_H };
    };

    const handleDown = (e: PointerEvent) => {
      if (activePointerIdRef.current !== null) return;
      const wp = screenToLens(e.clientX, e.clientY);
      if (!wp) return;
      activePointerIdRef.current = e.pointerId;
      isDownRef.current = true;
      lastSideRef.current = null;
      const { isLeft, inside, x, y } = worldToTex(wp.worldX, wp.worldZ);
      if (!inside) return;
      if (isLeft) {
        lastSideRef.current = "left";
        startStroke(x, y);
        onScratchStartRef.current();
      } else {
        lastSideRef.current = "right";
        tryAddSpark(x, y, performance.now() / 1000);
        onProtectStartRef.current();
      }
    };

    const handleMove = (e: PointerEvent) => {
      if (e.pointerId !== activePointerIdRef.current) return;
      if (!isDownRef.current) return;
      const wp = screenToLens(e.clientX, e.clientY);
      if (!wp) return;
      const { isLeft, inside, x, y } = worldToTex(wp.worldX, wp.worldZ);
      if (!inside) {
        lastSideRef.current = null;
        return;
      }
      const curSide: "left" | "right" = isLeft ? "left" : "right";
      if (curSide !== lastSideRef.current) {
        if (curSide === "left") {
          startStroke(x, y);
          onScratchStartRef.current();
        } else {
          tryAddSpark(x, y, performance.now() / 1000);
          onProtectStartRef.current();
        }
        lastSideRef.current = curSide;
      } else if (curSide === "left") {
        pushStrokePoint(x, y);
      } else {
        tryAddSpark(x, y, performance.now() / 1000);
      }
    };

    const handleUp = (e: PointerEvent) => {
      if (e.pointerId !== activePointerIdRef.current) return;
      activePointerIdRef.current = null;
      isDownRef.current = false;
      lastSideRef.current = null;
    };

    canvas.addEventListener("pointerdown", handleDown);
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    return () => {
      canvas.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [camera, gl]);

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

    // --- Left lens (scratches) ---
    const sctx = scratchCanvas.getContext("2d");
    if (sctx) {
      sctx.clearRect(0, 0, TEX_W, TEX_H);
      sctx.fillStyle = "rgba(252,165,165,0.07)";
      sctx.fillRect(0, 0, TEX_W, TEX_H);

      sctx.lineCap = "round";
      sctx.lineJoin = "round";
      for (const stroke of strokesRef.current) {
        if (stroke.points.length === 0) continue;
        // Single-point stroke (a tap with no drag) — Canvas2D's `stroke`
        // on a path that only has `moveTo` draws nothing, so a tap used
        // to silently disappear. Render it as a small impact divot.
        if (stroke.points.length === 1) {
          const p = stroke.points[0];
          sctx.fillStyle = "rgba(15,23,42,0.18)";
          sctx.beginPath();
          sctx.arc(p.x, p.y, 5.5, 0, Math.PI * 2);
          sctx.fill();
          sctx.fillStyle = "rgba(15,23,42,0.95)";
          sctx.beginPath();
          sctx.arc(p.x, p.y, 2.6, 0, Math.PI * 2);
          sctx.fill();
          sctx.fillStyle = "rgba(255,255,255,0.75)";
          sctx.beginPath();
          sctx.arc(p.x - 0.9, p.y - 0.9, 0.9, 0, Math.PI * 2);
          sctx.fill();
          continue;
        }
        // Soft outer halo — like the lens micro-fracture haze around
        // a deep groove. Drawn first so the dark groove sits on top.
        sctx.strokeStyle = "rgba(15,23,42,0.18)";
        sctx.lineWidth = 8;
        sctx.beginPath();
        stroke.points.forEach((p, i) => {
          if (i === 0) sctx.moveTo(p.x, p.y);
          else sctx.lineTo(p.x, p.y);
        });
        sctx.stroke();
        // Main groove — much darker and wider than before so it reads
        // through the translucent substrate instead of disappearing.
        sctx.strokeStyle = "rgba(15,23,42,0.95)";
        sctx.lineWidth = 4;
        sctx.beginPath();
        stroke.points.forEach((p, i) => {
          if (i === 0) sctx.moveTo(p.x, p.y);
          else sctx.lineTo(p.x, p.y);
        });
        sctx.stroke();
        // Bright sliver above the groove for cut-glass feel.
        sctx.strokeStyle = "rgba(255,255,255,0.7)";
        sctx.lineWidth = 1.2;
        sctx.beginPath();
        stroke.points.forEach((p, i) => {
          if (i === 0) sctx.moveTo(p.x - 1.2, p.y - 1.2);
          else sctx.lineTo(p.x - 1.2, p.y - 1.2);
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
        const age = Math.max(0, Math.min(1, (now - spark.bornAt) / SPARK_LIFE));
        const alpha = 1 - age;
        const radius = Math.max(0.5, 18 + age * 30);

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
