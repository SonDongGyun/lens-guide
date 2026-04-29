"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

// 3D water-bead simulation for the hydrophobic coating "after" view.
// Beads spawn near the top of a virtual lens disk, hover briefly under
// surface tension, then accelerate down before fading at the bottom
// and respawning. Glossy phong material + a top-front directional rig
// give the dimensional cue.

interface Drop {
  x: number;
  y: number;
  z: number;
  vy: number;
  size: number;
  age: number;
  state: "settling" | "rolling";
}

const NUM_DROPS = 11;
const LENS_RADIUS = 1.0;
const SPAWN_RANGE_X = 1.4;
const SPAWN_Y_TOP = 1.05;
const KILL_Y = -1.05;

export function HydroVisual3D() {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 30 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[2.5, 4, 3]}
          intensity={1.6}
          color="#FFFFFF"
        />
        <pointLight position={[-2, 1.5, 2]} intensity={0.5} color="#9DB6FF" />
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
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((_, dt) => {
    const drops = dropsRef.current;

    for (let i = 0; i < drops.length; i++) {
      const d = drops[i];
      d.age += dt;
      const mesh = meshRefs.current[i];

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

      if (mesh) {
        mesh.position.set(d.x, d.y, d.z);
        const wobble =
          d.state === "settling"
            ? 1 + Math.sin(d.age * 8 + i) * 0.045
            : 1;
        mesh.scale.setScalar(d.size * wobble);
      }
    }
  });

  return (
    <group>
      {dropsRef.current.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshRefs.current[i] = el;
          }}
          raycast={() => null}
        >
          <sphereGeometry args={[1, 24, 24]} />
          <meshPhongMaterial
            color="#C7E2FF"
            transparent
            opacity={0.88}
            shininess={120}
            specular="#FFFFFF"
            emissive="#1F4E80"
            emissiveIntensity={0.08}
          />
        </mesh>
      ))}
    </group>
  );
}
