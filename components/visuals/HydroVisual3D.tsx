"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

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
// Engineered for the sharp classic water-drop look:
// - rounded hemisphere bottom (y -1 → -0.2)
// - wide belly peaking near y = 0
// - long tapering upper third with a long, thin apex extending up
//   to y ≈ 1.45 (taller than wide, so the silhouette reads as a
//   pointed drop and not a potato).
const TEARDROP_PROFILE: Array<[number, number]> = [
  [0.0, -1.0],
  [0.32, -0.94],
  [0.58, -0.82],
  [0.75, -0.66],
  [0.86, -0.46],
  [0.92, -0.22],
  [0.94, 0.04],
  [0.92, 0.28],
  [0.82, 0.5],
  [0.66, 0.68],
  [0.46, 0.84],
  [0.28, 0.98],
  [0.14, 1.14],
  [0.05, 1.3],
  [0.0, 1.46],
];

export function HydroVisual3D() {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 30 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
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
      </Canvas>
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
      d.age += dt;
      const bead = beadRefs.current[i];
      const glint = glintRefs.current[i];

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

      const wobble =
        d.state === "settling" ? 1 + Math.sin(d.age * 8 + i) * 0.045 : 1;
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
