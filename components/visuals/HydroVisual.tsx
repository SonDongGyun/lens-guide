"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { use3DSupport, markUnsupported } from "@/lib/use3DSupport";
import { ThreeBoundary } from "./ThreeBoundary";

const HydroVisual3D = dynamic(
  () => import("./HydroVisual3D").then((m) => m.HydroVisual3D),
  { ssr: false, loading: () => null }
);

// Drop-in replacement for the static "after" hydrophobic visual.
// Real WebGL → 3D rolling beads. No WebGL → 2D bobbing fallback.
export function HydroVisual() {
  const supports3D = use3DSupport();

  if (supports3D === null) return null;
  if (!supports3D) return <HydroDrops2D />;

  return (
    <ThreeBoundary
      label="HydroVisual3D"
      fallback={<HydroDrops2D />}
      onError={markUnsupported}
    >
      <HydroVisual3D />
    </ThreeBoundary>
  );
}

function HydroDrops2D() {
  const drops = [
    { left: 18, top: 22, size: 28, delay: 0 },
    { left: 62, top: 18, size: 22, delay: 0.5 },
    { left: 32, top: 48, size: 36, delay: 0.2 },
    { left: 72, top: 46, size: 18, delay: 0.8 },
    { left: 50, top: 30, size: 14, delay: 1.1 },
    { left: 22, top: 68, size: 24, delay: 0.4 },
    { left: 58, top: 70, size: 30, delay: 0.7 },
    { left: 78, top: 28, size: 16, delay: 0.9 },
    { left: 44, top: 78, size: 20, delay: 0.3 },
  ];
  return (
    <div aria-hidden="true">
      {drops.map((d, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            background:
              "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.95) 0%, rgba(210,230,255,0.78) 28%, rgba(140,180,225,0.55) 60%, rgba(95,140,200,0.42) 100%)",
            boxShadow:
              "0 3px 8px rgba(0,0,0,0.22), inset -2px -3px 6px rgba(80,120,180,0.32), inset 2px 2px 3px rgba(255,255,255,0.4)",
          }}
          animate={{ y: [0, 6 + (i % 3) * 2, 0] }}
          transition={{
            duration: 3 + i * 0.27,
            repeat: Infinity,
            ease: "easeInOut",
            delay: d.delay,
          }}
        >
          <div
            aria-hidden
            className="absolute rounded-full"
            style={{
              left: "20%",
              top: "16%",
              width: "30%",
              height: "20%",
              background: "rgba(255,255,255,0.85)",
              filter: "blur(0.8px)",
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
