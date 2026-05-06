"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";
import { KioskCanvas } from "./KioskCanvas";

// 3D water-bead simulation for the hydrophobic coating "after" view.
// Beads spawn near the top of a virtual lens disk, hover briefly under
// surface tension, then accelerate down before fading at the bottom
// and respawning. Each bead is a custom-revolved teardrop (pointy top,
// rounded bottom) — the iconic water-drop silhouette — rendered with
// meshPhysicalMaterial (clearcoat + transmission) so it reads as
// glossy *water*, plus an offset highlight sphere for the sun glint.

interface Drop {
  x: number;
  y: number;
  z: number;
  vy: number;
  size: number;
  age: number;
  state: "settling" | "rolling";
}

const NUM_DROPS = 6;
const LENS_RADIUS = 1.0;
const SPAWN_RANGE_X = 1.25;
const SPAWN_Y_TOP = 1.05;
const KILL_Y = -1.05;

// Profile points (r, y) revolved around Y to form the bead silhouette.
// Sharper, narrower 💧 — the body is now genuinely conical instead of
// a wide belly with a tail. Aspect ratio ≈ 2:1 (height:width).
// - rounded hemisphere bottom (y -1 → -0.4)
// - much tighter belly: peak r=0.62 at y ≈ -0.05 (was 0.95)
// - long, gradually-tapering body — no shoulder break
// - thin pointy apex extending to y = 1.78
const TEARDROP_PROFILE: Array<[number, number]> = [
  [0.0, -1.0],
  [0.2, -0.94],
  [0.38, -0.82],
  [0.5, -0.66],
  [0.57, -0.46],
  [0.61, -0.24],
  [0.62, 0.0],
  [0.6, 0.22],
  [0.55, 0.4],
  [0.48, 0.56],
  [0.39, 0.72],
  [0.29, 0.88],
  [0.2, 1.06],
  [0.12, 1.26],
  [0.06, 1.48],
  [0.02, 1.66],
  [0.0, 1.78],
];

export function HydroVisual3D() {
  return (
    <div className="absolute inset-0">
      <KioskCanvas camera={{ position: [0, 0, 4], fov: 30 }}>
        <ambientLight intensity={0.45} />
        <hemisphereLight args={["#CFE1FF", "#1A2240", 0.4]} />
        <directionalLight
          position={[2.5, 4, 3]}
          intensity={1.4}
          color="#FFFFFF"
        />
        <directionalLight
          position={[-3, 2, 2]}
          intensity={0.5}
          color="#B0C7FF"
        />
        <pointLight position={[0, 2.5, 3]} intensity={0.5} color="#FFFFFF" />
        <DropField />
      </KioskCanvas>
    </div>
  );
}

function makeDrop(stagger: number): Drop {
  const size = 0.07 + Math.random() * 0.09;
  return {
    x: (Math.random() - 0.5) * SPAWN_RANGE_X,
    y: SPAWN_Y_TOP - Math.random() * 0.4,
    z: size * 0.45,
    vy: 0,
    size,
    age: -stagger,
    state: "settling",
  };
}

function DropField() {
  const dropsRef = useRef<Drop[]>(
    Array.from({ length: NUM_DROPS }, (_, i) => makeDrop(i * 0.35))
  );
  const beadRefs = useRef<(THREE.Mesh | null)[]>([]);
  const glintRefs = useRef<(THREE.Mesh | null)[]>([]);
  const reducedMotion = useReducedMotion();

  // One geometry shared by every bead — drops scale their mesh
  // independently rather than each owning a fresh allocation.
  const dropGeometry = useMemo(() => {
    const points = TEARDROP_PROFILE.map(
      ([r, y]) => new THREE.Vector2(r, y)
    );
    const geo = new THREE.LatheGeometry(points, 36);
    geo.computeVertexNormals();
    return geo;
  }, []);

  useEffect(() => {
    return () => {
      dropGeometry.dispose();
    };
  }, [dropGeometry]);

  useFrame((_, dt) => {
    const drops = dropsRef.current;

    for (let i = 0; i < drops.length; i++) {
      const d = drops[i];
      const bead = beadRefs.current[i];
      const glint = glintRefs.current[i];

      // Skip continuous physics when the user prefers reduced motion —
      // drops freeze at their initial spawn positions. Mesh sync still
      // runs so refs that mount after the first tick get placed.
      if (!reducedMotion) {
        d.age += dt;

        if (d.state === "settling") {
          if (d.age > 0.6 + (i % 3) * 0.18) {
            d.state = "rolling";
          }
        }

        if (d.state === "rolling") {
          d.vy += dt * 0.6;
          d.y -= d.vy * dt;
          // slight horizontal drift along curvature
          d.x += Math.sin(d.age * 2 + i) * dt * 0.04;
        }

        // respawn when off the bottom or outside the disk radius
        if (d.y < KILL_Y || Math.hypot(d.x, d.y) > LENS_RADIUS + 0.1) {
          Object.assign(d, makeDrop(0));
        }
      }

      const wobble =
        !reducedMotion && d.state === "settling"
          ? 1 + Math.sin(d.age * 8 + i) * 0.045
          : 1;
      const scale = d.size * wobble;

      if (bead) {
        bead.position.set(d.x, d.y, d.z);
        bead.scale.set(scale, scale, scale);
      }
      if (glint) {
        // Park the highlight on the wide belly (just above the
        // widest cross-section) so it reads like a single sun-glint
        // sitting on the front of the drop.
        glint.position.set(
          d.x - scale * 0.45,
          d.y + scale * 0.1,
          d.z + scale * 0.82
        );
        const glintSize = d.size * 0.18 * wobble;
        glint.scale.setScalar(glintSize);
      }
    }
  });

  return (
    <group>
      {dropsRef.current.map((_, i) => (
        <group key={i}>
          <mesh
            geometry={dropGeometry}
            ref={(el) => {
              beadRefs.current[i] = el;
            }}
            raycast={() => null}
          >
            <meshPhysicalMaterial
              color="#DCEBFF"
              transparent
              opacity={0.78}
              roughness={0.04}
              metalness={0}
              clearcoat={1}
              clearcoatRoughness={0.05}
              reflectivity={0.6}
              ior={1.33}
              transmission={0.55}
              thickness={0.5}
              attenuationColor="#7AA8E0"
              attenuationDistance={1.4}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh
            ref={(el) => {
              glintRefs.current[i] = el;
            }}
            raycast={() => null}
          >
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial
              color="#FFFFFF"
              transparent
              opacity={0.85}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
