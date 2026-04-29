"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

// 3D water-bead simulation for the hydrophobic coating "after" view.
// Beads spawn near the top of a virtual lens disk, hover briefly under
// surface tension, then accelerate down before fading at the bottom
// and respawning. Beads use meshPhysicalMaterial with clearcoat so
// they read as glossy *water*, plus a tiny offset highlight sphere to
// fake the specular sun glint that makes a droplet feel wet.

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

// Beads on a hydrophobic surface aren't perfect spheres — surface
// tension flattens them slightly. Squashing Y reads more like water
// than a marble.
const BEAD_Y_SQUISH = 0.82;

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
      const scaleX = d.size * wobble;
      const scaleY = d.size * wobble * BEAD_Y_SQUISH;
      const scaleZ = d.size * wobble;

      if (bead) {
        bead.position.set(d.x, d.y, d.z);
        bead.scale.set(scaleX, scaleY, scaleZ);
      }
      if (glint) {
        // Park the highlight on the upper-left shoulder of the bead
        // so it reads like a single sun-glint per drop.
        glint.position.set(
          d.x - scaleX * 0.42,
          d.y + scaleY * 0.46,
          d.z + scaleZ * 0.55
        );
        const glintSize = d.size * 0.22 * wobble;
        glint.scale.setScalar(glintSize);
      }
    }
  });

  return (
    <group>
      {dropsRef.current.map((_, i) => (
        <group key={i}>
          <mesh
            ref={(el) => {
              beadRefs.current[i] = el;
            }}
            raycast={() => null}
          >
            <sphereGeometry args={[1, 32, 32]} />
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
