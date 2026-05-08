"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { KioskCanvas } from "@/components/visuals/KioskCanvas";
import { cn } from "@/lib/utils";

// Interactive cross-section of how a contact lens "fits" the cornea.
// The user drags a slider to vary the lens BC (back curve radius) while
// the cornea radius stays fixed. Three things follow:
//   1. The lens geometry rebuilds (Lathe profile around the y-axis)
//   2. The lens y-position adjusts so the lens never penetrates the
//      cornea (steep BC → lens edge sits on cornea, apex lifts)
//   3. The status panel reclassifies the fit (steep / good / flat)
//
// A "단면" view tab swaps the camera to a clean side angle so the
// gap between the surfaces becomes obvious. The 3D view keeps a
// gentle yaw so the dome shape is readable. A reduced-motion path
// renders three labeled SVG cross-sections instead of mounting r3f.

const CORNEA_R = 8.0;
const LENS_DIAMETER = 14.0;
const LENS_A = LENS_DIAMETER / 2;
const LENS_THICKNESS = 0.4;

const BC_MIN = 7.6;
const BC_MAX = 9.0;
const BC_STEP = 0.1;
// Real-world contact lens BCs sit slightly flatter than the cornea to
// allow tear flow underneath; we widen the "good" band a touch so the
// slider has a fitted region rather than a single sweet spot.
const BC_GOOD_LO = 7.9;
const BC_GOOD_HI = 8.3;

type View = "oblique" | "side";

const VIEW_POSITIONS: Record<View, [number, number, number]> = {
  oblique: [12, 5, 18],
  side: [22, 0, 0.001],
};

export function BCFit3D() {
  const [bc, setBc] = useState(8.1);
  const [view, setView] = useState<View>("oblique");
  const fit = useMemo(() => classifyFit(bc), [bc]);

  return (
    <div className="relative">
      <div className="relative w-full aspect-[16/10] rounded-3xl bg-gradient-to-br from-[#0E1628] via-[#101a36] to-[#1a1230] overflow-hidden border border-ink-100 shadow-card">
        <div
          aria-hidden
          className="absolute inset-0 opacity-60 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 30% 20%, rgba(123,97,255,0.20), transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(49,130,246,0.22), transparent 60%)",
          }}
        />

        <KioskCanvas
          camera={{ position: VIEW_POSITIONS.oblique, fov: 32, near: 0.1, far: 220 }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[6, 10, 8]} intensity={1.0} color="#FFFFFF" />
          <directionalLight position={[-5, -3, -6]} intensity={0.4} color="#9DB6FF" />

          <CameraRig view={view} />
          <Cornea />
          <Lens bc={bc} fit={fit.kind} />
          <ContactRing bc={bc} fit={fit.kind} />
        </KioskCanvas>

        <div className="absolute top-2.5 sm:top-4 left-1/2 -translate-x-1/2 z-10 inline-flex p-0.5 sm:p-1 rounded-xl sm:rounded-2xl bg-black/45 backdrop-blur-md border border-white/10">
          {(["oblique", "side"] as View[]).map((v) => {
            const active = view === v;
            const label = v === "oblique" ? "3D" : "단면";
            return (
              <button
                key={v}
                type="button"
                aria-pressed={active}
                aria-label={`${label} 시점`}
                onClick={() => setView(v)}
                className={cn(
                  "relative px-3 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-colors min-w-[44px] min-h-[32px]",
                  active
                    ? "bg-white text-ink-900 shadow-card"
                    : "text-white/70 hover:text-white"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="absolute top-2.5 sm:top-4 left-2.5 sm:left-4 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/12 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold tracking-wider uppercase border border-white/15">
          BC <span className="font-num">{bc.toFixed(1)}</span> mm
        </div>

        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={cn(
            "absolute right-2.5 sm:right-4 top-2.5 sm:top-4 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full backdrop-blur-md border text-[10px] sm:text-xs font-bold tracking-wider uppercase",
            fit.kind === "good" &&
              "bg-accent-mint/20 border-accent-mint/40 text-[#7AFFC7]",
            fit.kind === "flat" &&
              "bg-accent-amber/20 border-accent-amber/40 text-[#FFC487]",
            fit.kind === "steep" &&
              "bg-accent-coral/20 border-accent-coral/40 text-[#FFB3B3]"
          )}
        >
          {fit.title}
        </div>

        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 text-white/40 text-[9px] font-medium tracking-wide pointer-events-none">
          * 개념 시뮬레이션 — 정확한 측정은 매장 검안 후
        </div>
      </div>

      <div className="mt-4 sm:mt-5">
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-ink-500 tracking-wide mb-2">
          <span>가파름</span>
          <span className="text-ink-700">베이스 커브 (BC)</span>
          <span>평평함</span>
        </div>
        <BCSlider bc={bc} onChange={setBc} />
      </div>

      <div
        className={cn(
          "mt-3 sm:mt-4 p-3 sm:p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed",
          fit.kind === "good" &&
            "bg-accent-mint/8 border-accent-mint/30 text-ink-700",
          fit.kind === "flat" &&
            "bg-accent-amber/8 border-accent-amber/30 text-ink-700",
          fit.kind === "steep" &&
            "bg-accent-coral/8 border-accent-coral/30 text-ink-700"
        )}
      >
        <span className="font-semibold text-ink-900">{fit.title}.</span>{" "}
        {fit.desc}
      </div>
    </div>
  );
}

interface FitInfo {
  kind: "good" | "flat" | "steep";
  title: string;
  desc: string;
}

function classifyFit(bc: number): FitInfo {
  if (bc >= BC_GOOD_LO && bc <= BC_GOOD_HI) {
    return {
      kind: "good",
      title: "잘 맞아요",
      desc: "각막 곡률과 렌즈 BC가 거의 일치해요. 가장자리도 들뜨지 않고 산소·눈물이 자연스럽게 흘러요.",
    };
  }
  if (bc < BC_GOOD_LO) {
    return {
      kind: "steep",
      title: "너무 가파르네요",
      desc: "렌즈가 각막보다 좁아 흡착돼요. 눈물 순환이 막혀 충혈·답답함이 생길 수 있어요.",
    };
  }
  return {
    kind: "flat",
    title: "너무 평평해요",
    desc: "렌즈 가장자리가 각막에서 들떠요. 깜박일 때 미끄러지거나 빠질 수 있어요.",
  };
}

function lensSag(R: number, a: number): number {
  return R - Math.sqrt(R * R - a * a);
}

// "Apex gap" — how far the lens vertex sits above the cornea apex.
// Positive when the lens is steeper than the cornea (lens edge sits
// on the cornea, vertex lifted off).
function apexGap(bc: number): number {
  return Math.max(0, lensSag(bc, LENS_A) - lensSag(CORNEA_R, LENS_A));
}

// "Edge gap" — how far the lens rim sits above the cornea at the
// lens-edge radial position. Positive when the lens is flatter than
// the cornea (vertex touches, rim lifts).
function edgeGap(bc: number): number {
  return Math.max(0, lensSag(CORNEA_R, LENS_A) - lensSag(bc, LENS_A));
}

function CameraRig({ view }: { view: View }) {
  const { camera } = useThree();
  const target = useMemo(() => {
    const [x, y, z] = VIEW_POSITIONS[view];
    return new THREE.Vector3(x, y, z);
  }, [view]);

  useFrame(() => {
    camera.position.lerp(target, 0.12);
    camera.lookAt(0, -1.2, 0);
  });
  return null;
}

function Cornea() {
  const geom = useMemo(() => {
    // Spherical cap, apex at world origin, dropping into -y as the
    // periphery falls away. phi range is enough to extend past the
    // lens edge so the user sees uncovered cornea around the lens.
    const g = new THREE.SphereGeometry(
      CORNEA_R,
      96,
      64,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2.4
    );
    g.translate(0, -CORNEA_R, 0);
    return g;
  }, []);
  useEffect(() => () => geom.dispose(), [geom]);

  // Sclera + iris + pupil sit underneath the cornea so the dome
  // reads as an actual eye, not a generic shape. The cornea itself
  // is rendered nearly transparent (it's clear in real life), so
  // what the user "sees" through it is the iris ring and pupil.
  return (
    <group>
      {/* sclera — flat white extending past the cornea rim. Sits just
          below the rim (y ≈ -5.93) so the dome reads as raised over
          the white, not poking through it. */}
      <mesh position={[0, -6.0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[14, 64]} />
        <meshStandardMaterial color="#F4F6FA" roughness={0.7} />
      </mesh>
      {/* iris — Korean-typical dark warm ring */}
      <mesh position={[0, -2.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 4.6, 96]} />
        <meshStandardMaterial color="#5C4636" roughness={0.55} />
      </mesh>
      {/* iris darker outer limbus, just inside the cornea rim */}
      <mesh position={[0, -2.55, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.55, 4.85, 96]} />
        <meshStandardMaterial color="#2C2018" roughness={0.6} />
      </mesh>
      {/* pupil — black at center */}
      <mesh position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.5, 64]} />
        <meshStandardMaterial color="#06080F" roughness={0.4} />
      </mesh>
      {/* cornea — translucent glass dome over the iris/pupil */}
      <mesh geometry={geom}>
        <meshStandardMaterial
          color="#FFFFFF"
          roughness={0.12}
          metalness={0.15}
          transparent
          opacity={0.28}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function Lens({ bc, fit }: { bc: number; fit: FitInfo["kind"] }) {
  const geom = useMemo(() => buildLensGeometry(bc), [bc]);
  useEffect(() => () => geom.dispose(), [geom]);

  // y-offset: lens local origin (back vertex) → world position. The
  // lens is "lifted" until no part of its back surface penetrates
  // the cornea. The lift equals the apex-gap when steep, zero when
  // flat-or-equal.
  const yOffset = useMemo(() => apexGap(bc), [bc]);

  const color =
    fit === "good" ? "#9CE5FF" : fit === "steep" ? "#FFB3B3" : "#FFD9A8";

  return (
    <mesh geometry={geom} position={[0, yOffset, 0]}>
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.44}
        roughness={0.12}
        metalness={0.05}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function buildLensGeometry(bc: number, segs = 64): THREE.LatheGeometry {
  // Profile in (rho, y), to be rotated around the y-axis.
  // - Back surface: portion of sphere radius bc, center (0, -bc, 0).
  //   y_back(rho) = -bc + sqrt(bc² - rho²); y_back(0) = 0 (vertex).
  // - Front surface: parallel offset by LENS_THICKNESS in +y. Slightly
  //   simplified vs. real concentric-front lenses, but visually clean
  //   and the rim has consistent thickness.
  const points: THREE.Vector2[] = [];
  // back surface: rho 0 → LENS_A
  for (let i = 0; i <= segs; i++) {
    const rho = (LENS_A * i) / segs;
    const y = -bc + Math.sqrt(Math.max(0, bc * bc - rho * rho));
    points.push(new THREE.Vector2(rho, y));
  }
  // climb the rim by thickness
  const yRim = -bc + Math.sqrt(Math.max(0, bc * bc - LENS_A * LENS_A));
  points.push(new THREE.Vector2(LENS_A, yRim + LENS_THICKNESS));
  // front surface: rho LENS_A → 0
  for (let i = segs - 1; i >= 0; i--) {
    const rho = (LENS_A * i) / segs;
    const y =
      -bc + Math.sqrt(Math.max(0, bc * bc - rho * rho)) + LENS_THICKNESS;
    points.push(new THREE.Vector2(rho, y));
  }
  const g = new THREE.LatheGeometry(points, 96);
  g.computeVertexNormals();
  return g;
}

// Thin glow on the contact zone — a circle at the lens-edge radius
// for steep fits, a small disk at the apex for flat fits, and a soft
// full-coverage haze when the BC matches.
function ContactRing({ bc, fit }: { bc: number; fit: FitInfo["kind"] }) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ringRef.current) return;
    const t = clock.getElapsedTime();
    const pulse = 0.85 + 0.15 * Math.sin(t * 2.2);
    const mat = ringRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = pulse * (fit === "good" ? 0.55 : 0.7);
  });

  if (fit === "good") {
    // soft full-coverage tint
    return (
      <mesh
        ref={ringRef}
        position={[0, 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[LENS_A * 0.95, 64]} />
        <meshBasicMaterial
          color="#7AFFC7"
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </mesh>
    );
  }

  if (fit === "steep") {
    // ring at lens edge — the only contact zone
    const yContact = lensSag(CORNEA_R, LENS_A) * -1;
    return (
      <mesh
        ref={ringRef}
        position={[0, yContact + 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[LENS_A - 0.25, LENS_A + 0.05, 96]} />
        <meshBasicMaterial
          color="#FFB3B3"
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    );
  }

  // flat: contact at apex only
  return (
    <mesh
      ref={ringRef}
      position={[0, 0.02, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <circleGeometry args={[0.6, 32]} />
      <meshBasicMaterial
        color="#FFD9A8"
        transparent
        opacity={0.7}
        depthWrite={false}
      />
    </mesh>
  );
}

function BCSlider({
  bc,
  onChange,
}: {
  bc: number;
  onChange: (n: number) => void;
}) {
  const goodLeft = ((BC_GOOD_LO - BC_MIN) / (BC_MAX - BC_MIN)) * 100;
  const goodRight = ((BC_GOOD_HI - BC_MIN) / (BC_MAX - BC_MIN)) * 100;
  const thumbT = ((bc - BC_MIN) / (BC_MAX - BC_MIN)) * 100;

  return (
    <div className="relative h-11 select-none">
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 rounded-full bg-ink-50">
        <div
          aria-hidden
          className="absolute top-0 bottom-0 rounded-full bg-accent-mint/35"
          style={{ left: `${goodLeft}%`, right: `${100 - goodRight}%` }}
        />
      </div>

      {/* tick labels */}
      <div className="absolute inset-x-0 top-full mt-1 flex justify-between text-[10px] sm:text-[11px] font-num text-ink-300 pointer-events-none">
        <span>{BC_MIN.toFixed(1)}</span>
        <span className="text-ink-500">8.0</span>
        <span>8.5</span>
        <span>{BC_MAX.toFixed(1)}</span>
      </div>

      <div
        aria-hidden
        className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-2 border-brand shadow-card pointer-events-none"
        style={{ left: `calc(${thumbT}% - 12px)` }}
      />

      <input
        type="range"
        min={BC_MIN}
        max={BC_MAX}
        step={BC_STEP}
        value={bc}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`베이스 커브 ${bc.toFixed(1)} 밀리미터`}
        aria-valuemin={BC_MIN}
        aria-valuemax={BC_MAX}
        aria-valuenow={bc}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer touch-none"
      />
    </div>
  );
}
