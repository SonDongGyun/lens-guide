"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";
import { INDEXES, type IndexId } from "@/lib/data";
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

// Pulled back ~50 % from the original framing because mobile/tablet
// viewports were rendering the lens too large — overlays (tabs at top,
// edge-thickness HUD at right) clipped into it. Larger margin now leaves
// room for the chrome on every view, including mobile portrait widths.
const VIEW_POSITIONS: Record<View, [number, number, number]> = {
  front: [0, 0, 108],
  oblique: [72, 32, 72],
  side: [108, 0, 0],
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

      {/* 4-index comparison strip + ghost legend */}
      <ComparisonStrip
        prescription={prescription}
        currentIndex={index}
        showGhost={showGhost}
      />

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

function ComparisonStrip({
  prescription,
  currentIndex,
  showGhost,
}: {
  prescription: number;
  currentIndex: IndexId;
  showGhost: boolean;
}) {
  const items = INDEXES.map((idx) => ({
    id: idx.id,
    edgeMM: computeEdgeMM(prescription, idx.thicknessFactor),
  }));
  const maxEdge = Math.max(...items.map((i) => i.edgeMM));

  return (
    <div className="absolute bottom-4 sm:bottom-5 left-2.5 sm:left-4 right-2.5 sm:right-4 z-10 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-black/45 backdrop-blur-md border border-white/10">
      <div className="flex items-center justify-between mb-1 sm:mb-1.5 gap-2">
        <div className="min-w-0 truncate text-[9px] sm:text-[10px] font-bold tracking-wider uppercase text-white/55">
          가장자리 비교 · 도수 {prescription.toFixed(2)}D 기준
        </div>
        {showGhost && (
          <div className="flex items-center gap-1 shrink-0 text-[8px] sm:text-[9px] text-white/55">
            <span className="inline-block w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm border border-white/45 bg-white/10" />
            1.56 기준선
          </div>
        )}
      </div>
      <div className="space-y-0.5 sm:space-y-1">
        {items.map((item) => {
          const active = item.id === currentIndex;
          const w = (item.edgeMM / maxEdge) * 100;
          return (
            <div
              key={item.id}
              className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs"
            >
              <span
                className={cn(
                  "font-bold w-9 sm:w-11 shrink-0 font-num",
                  active ? "text-white" : "text-white/55"
                )}
              >
                {item.id}
              </span>
              <div className="flex-1 h-1.5 sm:h-2 bg-white/8 rounded-full overflow-hidden">
                <motion.div
                  className={cn(
                    "h-full rounded-full",
                    active
                      ? "bg-gradient-to-r from-brand to-purple-400"
                      : "bg-white/30"
                  )}
                  initial={false}
                  animate={{ width: `${w}%` }}
                  transition={{ type: "spring", stiffness: 200, damping: 24 }}
                />
              </div>
              <span
                className={cn(
                  "font-num font-semibold w-11 sm:w-14 text-right shrink-0",
                  active ? "text-white" : "text-white/55"
                )}
              >
                {item.edgeMM.toFixed(1)}mm
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
