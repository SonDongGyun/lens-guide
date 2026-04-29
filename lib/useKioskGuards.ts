"use client";

import { useEffect, useRef } from "react";
import { useWizard, type ScreenId } from "./store";

const IDLE_TIMEOUTS_MS: Partial<Record<ScreenId, number>> = {
  // welcome already idle by definition
  purpose: 90_000,
  discomfort: 90_000,
  "lens-type": 120_000, // visualization may invite longer dwell
  thickness: 120_000,
  coating: 120_000,
  result: 60_000,
  staff: 30_000, // next customer should be able to use immediately
};

/**
 * Wires kiosk-grade guards on the root page:
 *  - Idle auto-reset (per-screen timeout) → wizard.reset()
 *  - Browser back/forward block via history pushState trap
 *  - Refresh / unload doesn't need handling: wizard state is in-memory and resets
 */
export function useKioskGuards() {
  const screen = useWizard((s) => s.screen);
  const reset = useWizard((s) => s.reset);
  const lastActivityRef = useRef<number>(Date.now());

  // ---- Idle auto-reset ----
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (screen === "welcome") return; // already at idle home

    const timeout = IDLE_TIMEOUTS_MS[screen];
    if (!timeout) return;

    lastActivityRef.current = Date.now();

    const bump = () => {
      lastActivityRef.current = Date.now();
    };

    const events: (keyof WindowEventMap)[] = [
      "pointerdown",
      "pointermove",
      "keydown",
      "wheel",
      "touchstart",
    ];
    events.forEach((e) => window.addEventListener(e, bump, { passive: true }));

    const id = window.setInterval(() => {
      const idle = Date.now() - lastActivityRef.current;
      if (idle >= timeout) {
        reset();
      }
    }, 2_000);

    return () => {
      events.forEach((e) => window.removeEventListener(e, bump));
      window.clearInterval(id);
    };
  }, [screen, reset]);

  // ---- Browser back/forward trap ----
  useEffect(() => {
    if (typeof window === "undefined") return;

    // push a sentinel state so the first back action lands on it (and we re-push)
    window.history.pushState({ kiosk: true }, "", window.location.href);

    const onPop = () => {
      // user pressed back — push a sentinel back so navigation stays put
      window.history.pushState({ kiosk: true }, "", window.location.href);
    };

    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
}
