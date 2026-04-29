"use client";

export function detectWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    if (!gl) return false;
    // Some integrated GPUs report a context but immediately lose it.
    // Probe a basic call to be defensive.
    if ("getParameter" in gl) {
      (gl as WebGLRenderingContext).getParameter(
        (gl as WebGLRenderingContext).VERSION
      );
    }
    return true;
  } catch {
    return false;
  }
}
