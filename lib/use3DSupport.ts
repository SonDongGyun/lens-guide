"use client";

import { useEffect, useState } from "react";
import { detectWebGL } from "./webgl";

// Single module-level cache shared by every visual. Once we decide
// (or fall back) for one component, every other component honors that
// choice for the rest of the page lifetime.
let cached: boolean | null = null;

export function markUnsupported() {
  cached = false;
}

export function use3DSupport(): boolean | null {
  const [supports, setSupports] = useState<boolean | null>(() => cached);

  useEffect(() => {
    if (cached === null) {
      cached = detectWebGL();
    }
    setSupports(cached);
  }, []);

  return supports;
}
