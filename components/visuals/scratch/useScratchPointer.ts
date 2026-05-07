"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  LEFT_X,
  LENS_H,
  LENS_W,
  MAX_POINTS_PER_STROKE,
  MAX_STROKES,
  MIN_STROKE_STEP_PX,
  PAINT_Y,
  RIGHT_X,
  TEX_H,
  TEX_W,
  type Spark,
  type Stroke,
} from "./types";

interface Args {
  strokesRef: MutableRefObject<Stroke[]>;
  sparksRef: MutableRefObject<Spark[]>;
  onScratchStart: () => void;
  onProtectStart: () => void;
}

/**
 * DOM-level pointer plumbing for the scratch lab.
 *
 * We intentionally bypass R3F's mesh-event picker because the
 * previous picker-plane approach got stuck after a gesture-on-coated
 * → gesture-on-uncoated sequence (the third gesture would silently
 * no-op while the first two worked). DOM events on the canvas +
 * window are immune to that class of bug — pointerdown always
 * fires, pointermove/up/cancel are tracked on window so they fire
 * even when the finger leaves the canvas, and pointerId filtering
 * stops a second finger from corrupting the active gesture.
 */
export function useScratchPointer({
  strokesRef,
  sparksRef,
  onScratchStart,
  onProtectStart,
}: Args): void {
  const { camera, gl } = useThree();

  const isDownRef = useRef(false);
  const lastSideRef = useRef<"left" | "right" | null>(null);
  const lastSparkAtRef = useRef(0);
  // Tracks the active touch's pointerId so a second finger can't corrupt
  // the gesture mid-scratch. null = no active gesture.
  const activePointerIdRef = useRef<number | null>(null);

  // Stash the parent callbacks in refs so the DOM event listeners below
  // never go stale across re-renders. The parent passes inline arrows
  // every render, but we only attach listeners once.
  const onScratchStartRef = useRef(onScratchStart);
  const onProtectStartRef = useRef(onProtectStart);
  useEffect(() => {
    onScratchStartRef.current = onScratchStart;
    onProtectStartRef.current = onProtectStart;
  });

  useEffect(() => {
    const canvas = gl.domElement;

    const startStroke = (x: number, y: number) => {
      strokesRef.current.push({ points: [{ x, y }] });
      if (strokesRef.current.length > MAX_STROKES) {
        strokesRef.current.shift();
      }
    };
    const pushStrokePoint = (x: number, y: number) => {
      const cur = strokesRef.current[strokesRef.current.length - 1];
      if (!cur) return;
      const last = cur.points[cur.points.length - 1];
      if (last) {
        const dx = x - last.x;
        const dy = y - last.y;
        if (dx * dx + dy * dy < MIN_STROKE_STEP_PX * MIN_STROKE_STEP_PX)
          return;
      }
      if (cur.points.length >= MAX_POINTS_PER_STROKE) {
        strokesRef.current.push({ points: [{ x, y }] });
        if (strokesRef.current.length > MAX_STROKES) {
          strokesRef.current.shift();
        }
      } else {
        cur.points.push({ x, y });
      }
    };
    const tryAddSpark = (x: number, y: number, now: number) => {
      if (now - lastSparkAtRef.current < 0.045) return;
      lastSparkAtRef.current = now;
      sparksRef.current.push({ x, y, bornAt: now });
    };

    // Cast a screen-space pointer onto the *visible* lens plane (y =
    // PAINT_Y). Using the lens plane (not the picker plane) eliminates
    // parallax — the hit point lands exactly where the user perceives
    // the lens surface, regardless of camera angle.
    const screenToLens = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return null;
      const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -(((clientY - rect.top) / rect.height) * 2 - 1);
      const v = new THREE.Vector3(ndcX, ndcY, 0.5).unproject(camera);
      const dir = v.sub(camera.position).normalize();
      if (Math.abs(dir.y) < 1e-6) return null;
      const t = (PAINT_Y - camera.position.y) / dir.y;
      if (t < 0) return null;
      return {
        worldX: camera.position.x + t * dir.x,
        worldZ: camera.position.z + t * dir.z,
      };
    };

    const worldToTex = (worldX: number, worldZ: number) => {
      const isLeft = worldX < 0;
      const lensX = isLeft ? LEFT_X : RIGHT_X;
      const localX = worldX - lensX;
      const localY = -worldZ;
      const inside =
        (localX / LENS_W) ** 2 + (localY / LENS_H) ** 2 <= 1;
      const u = (localX + LENS_W) / (LENS_W * 2);
      const v = (localY + LENS_H) / (LENS_H * 2);
      return { isLeft, inside, x: u * TEX_W, y: (1 - v) * TEX_H };
    };

    const handleDown = (e: PointerEvent) => {
      if (activePointerIdRef.current !== null) return;
      const wp = screenToLens(e.clientX, e.clientY);
      if (!wp) return;
      activePointerIdRef.current = e.pointerId;
      isDownRef.current = true;
      lastSideRef.current = null;
      const { isLeft, inside, x, y } = worldToTex(wp.worldX, wp.worldZ);
      if (!inside) return;
      if (isLeft) {
        lastSideRef.current = "left";
        startStroke(x, y);
        onScratchStartRef.current();
      } else {
        lastSideRef.current = "right";
        tryAddSpark(x, y, performance.now() / 1000);
        onProtectStartRef.current();
      }
    };

    const handleMove = (e: PointerEvent) => {
      if (e.pointerId !== activePointerIdRef.current) return;
      if (!isDownRef.current) return;
      const wp = screenToLens(e.clientX, e.clientY);
      if (!wp) return;
      const { isLeft, inside, x, y } = worldToTex(wp.worldX, wp.worldZ);
      if (!inside) {
        lastSideRef.current = null;
        return;
      }
      const curSide: "left" | "right" = isLeft ? "left" : "right";
      if (curSide !== lastSideRef.current) {
        if (curSide === "left") {
          startStroke(x, y);
          onScratchStartRef.current();
        } else {
          tryAddSpark(x, y, performance.now() / 1000);
          onProtectStartRef.current();
        }
        lastSideRef.current = curSide;
      } else if (curSide === "left") {
        pushStrokePoint(x, y);
      } else {
        tryAddSpark(x, y, performance.now() / 1000);
      }
    };

    const handleUp = (e: PointerEvent) => {
      if (e.pointerId !== activePointerIdRef.current) return;
      activePointerIdRef.current = null;
      isDownRef.current = false;
      lastSideRef.current = null;
    };

    canvas.addEventListener("pointerdown", handleDown);
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    return () => {
      canvas.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [camera, gl, strokesRef, sparksRef]);
}
