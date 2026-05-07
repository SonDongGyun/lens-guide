"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { LENS_H, LENS_W, TEX_H, TEX_W } from "./types";

interface Result {
  scratchCanvas: HTMLCanvasElement;
  scratchTexture: THREE.CanvasTexture;
  sparkCanvas: HTMLCanvasElement;
  sparkTexture: THREE.CanvasTexture;
  leftPaintGeo: THREE.ShapeGeometry;
  rightPaintGeo: THREE.ShapeGeometry;
}

/**
 * Owns the canvas-backed textures and paint-plane geometries for the
 * scratch and protect lenses. Two independent canvases + textures so
 * the uncoated lens never has to know about sparks and the coated
 * lens never has to know about scratches.
 *
 * Cleanup is on unmount: disposing both textures and both geometries
 * frees the GPU buffers Three holds for them.
 */
export function useScratchTextures(lensShape: THREE.Shape): Result {
  const { scratchCanvas, scratchTexture, sparkCanvas, sparkTexture } = useMemo(
    () => {
      const make = () => {
        const c = document.createElement("canvas");
        c.width = TEX_W;
        c.height = TEX_H;
        const t = new THREE.CanvasTexture(c);
        t.minFilter = THREE.LinearFilter;
        t.magFilter = THREE.LinearFilter;
        return { c, t };
      };
      const left = make();
      const right = make();
      return {
        scratchCanvas: left.c,
        scratchTexture: left.t,
        sparkCanvas: right.c,
        sparkTexture: right.t,
      };
    },
    []
  );

  const leftPaintGeo = useMemo(
    () => buildPaintGeometry(lensShape),
    [lensShape]
  );
  const rightPaintGeo = useMemo(
    () => buildPaintGeometry(lensShape),
    [lensShape]
  );

  useEffect(() => {
    return () => {
      leftPaintGeo.dispose();
      rightPaintGeo.dispose();
      scratchTexture.dispose();
      sparkTexture.dispose();
    };
  }, [leftPaintGeo, rightPaintGeo, scratchTexture, sparkTexture]);

  return {
    scratchCanvas,
    scratchTexture,
    sparkCanvas,
    sparkTexture,
    leftPaintGeo,
    rightPaintGeo,
  };
}

// Remap the shape's vertex positions onto a normalized [0,1]² UV
// space so the canvas texture stretches across the lens silhouette
// correctly. Without this, the default ShapeGeometry UVs would map
// the canvas to the shape's bounding box in world units, which
// shifts the painted strokes off-center for non-unit-radius lenses.
function buildPaintGeometry(shape: THREE.Shape): THREE.ShapeGeometry {
  const geo = new THREE.ShapeGeometry(shape, 64);
  const positions = geo.attributes.position;
  const uvs = geo.attributes.uv;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    uvs.setXY(i, (x + LENS_W) / (LENS_W * 2), (y + LENS_H) / (LENS_H * 2));
  }
  uvs.needsUpdate = true;
  return geo;
}
