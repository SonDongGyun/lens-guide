// Shared types and constants for the scratch-lab visual. Extracted
// from ScratchVisual3D so the painter, texture manager, and pointer
// handler can each pull just what they need without dragging the
// React-component module.

export interface Stroke {
  points: { x: number; y: number }[];
}

export interface Spark {
  x: number;
  y: number;
  bornAt: number;
}

export const TEX_W = 720;
export const TEX_H = 800;
export const SPARK_LIFE = 0.75;
export const MAX_STROKES = 30;
export const MAX_POINTS_PER_STROKE = 250;
export const MIN_STROKE_STEP_PX = 3;

export const LENS_W = 1.8;
export const LENS_H = 2.0;
export const LEFT_X = -2.1;
export const RIGHT_X = 2.1;
// Substrate is extruded (depth 0.26 + bevelThickness 0.04) and rotated so
// its top face sits at world y ≈ 0.24. Paint must clear that top face or
// it renders *inside* the substrate volume and gets z-occluded. Pointer
// events also intersect this plane (see screenToLens) so the hit point
// matches what the user sees, not where some invisible picker sits.
export const PAINT_Y = 0.28;
export const COATING_Y = 0.32;
