"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";
import type { IndexId } from "@/lib/data";
import { cn } from "@/lib/utils";

interface Props {
  index: IndexId;
  thicknessFactor: number;
  prescription: number;
}

type View = "front" | "oblique" | "side";

const VIEW_LABELS: Record<View, string> = {
  front: "정면",
  oblique: "45°",
  side: "측면",
};

const VIEW_POSITIONS: Record<View, [number, number, number]> = {
  front: [0, 0, 50],
  oblique: [32, 14, 32],
  side: [50, 0, 0],
};

const RADIUS_MM = 15;
const CENTER_MM = 1.5;

function computeEdgeMM(prescription: number, thicknessFactor: number): number {
  const baseEdge = CENTER_MM + Math.abs(prescription) * 0.8;
  return CENTER_MM + (baseEdge - CENTER_MM) * thicknessFactor;
}

export function ThicknessVisual3D({ index, thicknessFactor, prescription }: Props) {
  const [view, setView] = useState<View>("oblique");
  const edgeMM = computeEdgeMM(prescription, thicknessFactor);

  return (
    <div className="w-full aspect-[16/10] rounded-3xl bg-gradient-to-br from-[#1A2240] via-[#0F1428] to-[#0D1320] shadow-card relative overflow-hidden border border-ink-100">
      <div
        aria-hidden
        className="absolute inset-0 opacity-60 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(123,97,255,0.18), transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(49,130,246,0.20), transparent 60%)",
        }}
      />

      <Canvas
        dpr={[1, 2]}
        camera={{ position: VIEW_POSITIONS.oblique, fov: 32, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[8, 10, 12]} intensity={1.0} color="#FFFFFF" />
        <directionalLight position={[-6, -3, -8]} intensity={0.45} color="#9DB6FF" />

        <CameraRig view={view} />
        <Frame radiusMM={RADIUS_MM} />
        <Lens edgeMM={edgeMM} centerMM={CENTER_MM} radiusMM={RADIUS_MM} />
        <RimHighlight edgeMM={edgeMM} radiusMM={RADIUS_MM} />
      </Canvas>

      {/* view toggle */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 inline-flex p-1 rounded-2xl bg-black/45 backdrop-blur-md border border-white/10">
        {(Object.keys(VIEW_LABELS) as View[]).map((v) => {
          const active = view === v;
          return (
            <motion.button
              key={v}
              onClick={() => setView(v)}
              whileTap={{ scale: 0.96 }}
              className={cn(
                "relative px-4 py-2 rounded-xl text-sm font-semibold transition-colors",
                active ? "text-ink-900" : "text-white/70 hover:text-white"
              )}
            >
              {active && (
                <motion.div
                  layoutId="thickness-view-tab"
                  className="absolute inset-0 rounded-xl bg-white shadow-card"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative">{VIEW_LABELS[v]}</span>
            </motion.button>
          );
        })}
      </div>

      {/* index + view badge */}
      <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-white/12 backdrop-blur-md text-white text-xs font-bold tracking-wider uppercase border border-white/15">
        {index} · {VIEW_LABELS[view]}
      </div>

      {/* edge thickness HUD */}
      <motion.div
        className="absolute right-6 top-1/2 -translate-y-1/2 text-right z-10"
        key={`${index}-${prescription.toFixed(2)}`}
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="text-[11px] uppercase tracking-wider text-white/55 font-semibold">
          가장자리 두께
        </div>
        <div className="text-4xl font-bold text-white font-num leading-none mt-1">
          {edgeMM.toFixed(1)}
          <span className="text-lg text-white/60 font-medium ml-1">mm</span>
        </div>
        <div className="text-[11px] text-white/50 mt-1">
          도수 {prescription.toFixed(2)}D 기준
        </div>
      </motion.div>

      {/* caption */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 z-10">
        <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur text-[11px] text-white/75 font-medium border border-white/10">
          프레임은 동일, 외곽 두께만 변합니다
        </div>
        <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur text-[11px] text-white/75 font-medium border border-white/10">
          압축률↑ → 더 얇아짐
        </div>
      </div>

      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 text-white/40 text-[9px] font-medium tracking-wide pointer-events-none">
        * 개념 시뮬레이션 — 정확한 두께는 매장 검안 후 확인됩니다
      </div>
    </div>
  );
}

function CameraRig({ view }: { view: View }) {
  const { camera } = useThree();
  const target = useMemo(() => {
    const [x, y, z] = VIEW_POSITIONS[view];
    return new THREE.Vector3(x, y, z);
  }, [view]);

  useFrame(() => {
    camera.position.lerp(target, 0.1);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function Frame({ radiusMM }: { radiusMM: number }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radiusMM + 0.6, 0.45, 16, 96]} />
      <meshStandardMaterial color="#1F2536" roughness={0.4} metalness={0.7} />
    </mesh>
  );
}

function Lens({
  edgeMM,
  centerMM,
  radiusMM,
}: {
  edgeMM: number;
  centerMM: number;
  radiusMM: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const currentEdgeRef = useRef(edgeMM);

  const initialGeo = useMemo(
    () => buildLatheGeometry(centerMM, edgeMM, radiusMM),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame(() => {
    const cur = currentEdgeRef.current;
    const diff = edgeMM - cur;
    if (Math.abs(diff) < 0.005) {
      if (cur !== edgeMM) currentEdgeRef.current = edgeMM;
      return;
    }
    const next = cur + diff * 0.12;
    currentEdgeRef.current = next;
    if (meshRef.current) {
      const old = meshRef.current.geometry;
      meshRef.current.geometry = buildLatheGeometry(centerMM, next, radiusMM);
      old.dispose();
    }
  });

  useEffect(() => {
    return () => {
      if (meshRef.current?.geometry) meshRef.current.geometry.dispose();
    };
  }, []);

  return (
    <mesh ref={meshRef} geometry={initialGeo} rotation={[Math.PI / 2, 0, 0]}>
      <meshStandardMaterial
        color="#9CC9FF"
        transparent
        opacity={0.55}
        roughness={0.18}
        metalness={0.05}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function RimHighlight({ edgeMM, radiusMM }: { edgeMM: number; radiusMM: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const currentEdgeRef = useRef(edgeMM);
  const baseHeight = 1;

  useFrame(() => {
    const cur = currentEdgeRef.current;
    const diff = edgeMM - cur;
    if (Math.abs(diff) >= 0.005) {
      currentEdgeRef.current = cur + diff * 0.12;
    } else if (cur !== edgeMM) {
      currentEdgeRef.current = edgeMM;
    }
    if (meshRef.current) {
      meshRef.current.scale.y = currentEdgeRef.current / baseHeight;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry
        args={[radiusMM + 0.08, radiusMM + 0.08, baseHeight, 96, 1, true]}
      />
      <meshStandardMaterial
        color="#3182F6"
        emissive="#3182F6"
        emissiveIntensity={0.7}
        transparent
        opacity={0.85}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function buildLatheGeometry(
  centerMM: number,
  edgeMM: number,
  radiusMM: number,
  segments = 28
): THREE.LatheGeometry {
  const points: THREE.Vector2[] = [];
  const c = centerMM;
  const e = edgeMM;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const tt = t * t * (3 - 2 * t);
    const x = t * radiusMM;
    const y = c / 2 + (e / 2 - c / 2) * tt;
    points.push(new THREE.Vector2(x, y));
  }
  const rimSubdivisions = 4;
  for (let i = 1; i <= rimSubdivisions; i++) {
    const t = i / rimSubdivisions;
    points.push(new THREE.Vector2(radiusMM, e / 2 - t * e));
  }
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const tt = t * t * (3 - 2 * t);
    const x = radiusMM * (1 - t);
    const y = -e / 2 + (-c / 2 - (-e / 2)) * tt;
    points.push(new THREE.Vector2(x, y));
  }

  return new THREE.LatheGeometry(points, 64);
}
