"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";
import { type IndexId } from "@/lib/data";
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

// Pulled in further so the lens fills more of the frame — chrome on
// the left/right (HUD, view tabs, reference pill) leaves a strip the
// lens can comfortably occupy without crowding.
const VIEW_POSITIONS: Record<View, [number, number, number]> = {
  front: [0, 0, 76],
  oblique: [51, 24, 51],
  side: [76, 0, 0],
};

const RADIUS_MM = 15;
const CENTER_MM = 1.5;

// Real-world reference thicknesses (mm), used so users can ground "4mm"
// against an object they hold every day.
const CARD_MM = 0.76; // standard credit/check card
const COIN_MM = 2.05; // 500원 동전

function computeEdgeMM(prescription: number, thicknessFactor: number): number {
  const baseEdge = CENTER_MM + Math.abs(prescription) * 0.8;
  return CENTER_MM + (baseEdge - CENTER_MM) * thicknessFactor;
}

export function ThicknessVisual3D({ index, thicknessFactor, prescription }: Props) {
  const [view, setView] = useState<View>("oblique");
  const edgeMM = computeEdgeMM(prescription, thicknessFactor);
  const baselineEdgeMM = computeEdgeMM(prescription, 1.0);
  const showGhost = thicknessFactor < 1.0;

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
        camera={{ position: VIEW_POSITIONS.oblique, fov: 32, near: 0.1, far: 320 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[8, 10, 12]} intensity={1.0} color="#FFFFFF" />
        <directionalLight position={[-6, -3, -8]} intensity={0.45} color="#9DB6FF" />

        <CameraRig view={view} />
        <Frame radiusMM={RADIUS_MM} />
        {showGhost && (
          <GhostLens
            edgeMM={baselineEdgeMM}
            centerMM={CENTER_MM}
            radiusMM={RADIUS_MM}
          />
        )}
        <Lens edgeMM={edgeMM} centerMM={CENTER_MM} radiusMM={RADIUS_MM} />
        <RimHighlight edgeMM={edgeMM} radiusMM={RADIUS_MM} />
      </Canvas>

      {/* view toggle */}
      <div className="absolute top-2.5 sm:top-4 left-1/2 -translate-x-1/2 z-10 inline-flex p-0.5 sm:p-1 rounded-xl sm:rounded-2xl bg-black/45 backdrop-blur-md border border-white/10">
        {(Object.keys(VIEW_LABELS) as View[]).map((v) => {
          const active = view === v;
          return (
            <motion.button
              key={v}
              onClick={() => setView(v)}
              whileTap={{ scale: 0.96 }}
              className={cn(
                "relative px-2.5 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-colors",
                active ? "text-ink-900" : "text-white/70 hover:text-white"
              )}
            >
              {active && (
                <motion.div
                  layoutId="thickness-view-tab"
                  className="absolute inset-0 rounded-lg sm:rounded-xl bg-white shadow-card"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative">{VIEW_LABELS[v]}</span>
            </motion.button>
          );
        })}
      </div>

      {/* index + view badge */}
      <div className="absolute top-2.5 sm:top-4 left-2.5 sm:left-4 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/12 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold tracking-wider uppercase border border-white/15">
        {index} · {VIEW_LABELS[view]}
      </div>

      {/* edge thickness HUD — right side */}
      <div className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center px-2 sm:px-2.5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-black/45 backdrop-blur-md border border-white/10">
        <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-white/55">
          가장자리
        </span>
        <span className="text-white text-base sm:text-xl font-bold font-num leading-none mt-1">
          {edgeMM.toFixed(1)}
        </span>
        <span className="text-[9px] sm:text-[10px] text-white/55 leading-none mt-0.5">
          mm
        </span>
      </div>

      {/* real-world reference — bottom-left */}
      <RealWorldReference edgeMM={edgeMM} />

      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 text-white/40 text-[9px] font-medium tracking-wide pointer-events-none">
        * 개념 시뮬레이션 — 정확한 두께는 매장 검안 후 확인됩니다
      </div>
    </div>
  );
}

// Anchors the abstract "X.X mm" number to objects users handle daily so
// the thickness becomes felt, not just read.
function RealWorldReference({ edgeMM }: { edgeMM: number }) {
  const cardCount = Math.max(1, Math.round(edgeMM / CARD_MM));
  const coinCount = Math.max(1, Math.round(edgeMM / COIN_MM));
  const cardBars = Math.min(cardCount, 6);

  return (
    <div className="absolute bottom-5 sm:bottom-7 left-2.5 sm:left-4 z-10 flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/10">
      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white/55 hidden sm:inline">
        체감
      </span>
      <span className="text-white/30 hidden sm:inline">·</span>
      <div className="flex items-center gap-1.5">
        <div className="flex flex-col gap-[1.5px]">
          {Array.from({ length: cardBars }).map((_, i) => (
            <div
              key={i}
              className="w-3 sm:w-3.5 h-[1.5px] bg-white/55 rounded-[1px]"
            />
          ))}
        </div>
        <span className="text-[10px] sm:text-xs text-white/80">
          신용카드 약 {cardCount}장
        </span>
      </div>
      <span className="text-white/30">·</span>
      <div className="flex items-center gap-1">
        <div className="flex flex-col gap-[1px]">
          {Array.from({ length: Math.min(coinCount, 4) }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-[3px] sm:h-[3.5px] bg-amber-200/70 rounded-full"
            />
          ))}
        </div>
        <span className="text-[10px] sm:text-xs text-white/80">
          500원 동전 {coinCount}개
        </span>
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

type ProfileItem = { r: number; alpha: number; beta: number };

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
  const settledRef = useRef(true);

  const profileSpec = useMemo(
    () => buildProfileSpec(centerMM, radiusMM),
    [centerMM, radiusMM]
  );

  const initialGeo = useMemo(() => {
    const points = specToPoints(profileSpec, edgeMM);
    const geo = new THREE.LatheGeometry(points, 64);
    return geo;
    // edgeMM only seeds the first frame; later changes flow through useFrame
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileSpec]);

  useEffect(() => {
    return () => {
      initialGeo.dispose();
    };
  }, [initialGeo]);

  useFrame(() => {
    if (!meshRef.current) return;
    const geo = meshRef.current.geometry as THREE.LatheGeometry;
    const cur = currentEdgeRef.current;
    const diff = edgeMM - cur;

    if (Math.abs(diff) < 0.005) {
      if (!settledRef.current) {
        currentEdgeRef.current = edgeMM;
        applyEdgeToGeometry(geo, profileSpec, edgeMM);
        geo.computeVertexNormals();
        settledRef.current = true;
      }
      return;
    }
    settledRef.current = false;
    const next = cur + diff * 0.12;
    currentEdgeRef.current = next;
    applyEdgeToGeometry(geo, profileSpec, next);
  });

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

// Static wireframe shell sized to the 1.56 baseline edge. The actual
// (thinner) lens nests inside it, making the compression effect
// readable at a glance — without animating per change.
function GhostLens({
  edgeMM,
  centerMM,
  radiusMM,
}: {
  edgeMM: number;
  centerMM: number;
  radiusMM: number;
}) {
  const profileSpec = useMemo(
    () => buildProfileSpec(centerMM, radiusMM),
    [centerMM, radiusMM]
  );
  const geo = useMemo(() => {
    const points = specToPoints(profileSpec, edgeMM);
    return new THREE.LatheGeometry(points, 64);
  }, [profileSpec, edgeMM]);

  useEffect(() => {
    return () => {
      geo.dispose();
    };
  }, [geo]);

  return (
    <mesh geometry={geo} rotation={[Math.PI / 2, 0, 0]} raycast={() => null}>
      <meshBasicMaterial
        color="#FFFFFF"
        wireframe
        transparent
        opacity={0.18}
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

function buildProfileSpec(
  centerMM: number,
  radiusMM: number,
  segments = 28,
  rimSubdivisions = 4
): ProfileItem[] {
  const items: ProfileItem[] = [];
  const cHalf = centerMM / 2;
  // Front face: y = (c/2)(1 - tt) + (e/2) tt → α = (c/2)(1-tt), β = tt/2
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const tt = t * t * (3 - 2 * t);
    items.push({ r: t * radiusMM, alpha: cHalf * (1 - tt), beta: tt / 2 });
  }
  // Outer rim: y goes from +e/2 to -e/2 → α = 0, β = 0.5 - t
  for (let i = 1; i <= rimSubdivisions; i++) {
    const t = i / rimSubdivisions;
    items.push({ r: radiusMM, alpha: 0, beta: 0.5 - t });
  }
  // Back face: y = -(c/2)(1-tt) - (e/2) tt → α = -(c/2)(1-tt), β = -tt/2
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const tt = t * t * (3 - 2 * t);
    items.push({ r: radiusMM * (1 - t), alpha: -cHalf * (1 - tt), beta: -tt / 2 });
  }
  return items;
}

function specToPoints(spec: ProfileItem[], edgeMM: number): THREE.Vector2[] {
  return spec.map((p) => new THREE.Vector2(p.r, p.alpha + p.beta * edgeMM));
}

// LatheGeometry vertex layout: outer loop = angle (segments+1), inner loop = profile.length.
// r is constant for a given profile index, so only Y needs updating when edge changes.
function applyEdgeToGeometry(
  geometry: THREE.LatheGeometry,
  spec: ProfileItem[],
  edgeMM: number
): void {
  const positions = geometry.attributes.position;
  const profileCount = spec.length;
  const total = positions.count;
  for (let i = 0; i < total; i++) {
    const j = i % profileCount;
    const item = spec[j];
    positions.setY(i, item.alpha + item.beta * edgeMM);
  }
  positions.needsUpdate = true;
}
