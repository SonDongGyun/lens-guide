"use client";

import { Canvas, type CanvasProps } from "@react-three/fiber";
import type { ReactNode } from "react";

// Shared Canvas wrapper for the kiosk's 3D visuals. Centralises the
// defaults the visuals always want — DPR clamp so retina screens don't
// quadruple the GPU cost, transparent background so the parent's CSS
// gradient shows through, and antialias for the lens edges.
//
// `style` is shallow-merged so callers can add their own keys (e.g.
// `touchAction: "none"`) without losing the transparent background.
interface Props extends Omit<CanvasProps, "children"> {
  children: ReactNode;
}

export function KioskCanvas({ children, style, ...rest }: Props) {
  return (
    // aria-hidden because WebGL output isn't perceivable to screen
    // readers — there's nothing in the canvas itself for AT to read.
    // The meaningful labels (HUDs, badges, hints) live in sibling DOM
    // outside this component, so they stay accessible. Without this,
    // AT users land on a focusable but empty canvas while tabbing.
    <Canvas
      aria-hidden="true"
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent", ...style }}
      {...rest}
    >
      {children}
    </Canvas>
  );
}
