"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Result {
  containerRef: (node: HTMLElement | null) => void;
  announcement: string;
}

/**
 * Wires the two AT signals fired on every wizard screen change:
 *  - move keyboard focus to the new screen container
 *  - announce the new screen's label via an aria-live region
 *
 * Callback ref (not useEffect+useRef) for focus: AnimatePresence
 * mode="wait" keeps the *exiting* node mounted during its transition,
 * so a screen-keyed effect would fire while a useRef still pointed
 * at the outgoing element. The callback fires when the incoming
 * motion.div actually mounts, which is after the exit animation —
 * focus lands on the visible screen.
 *
 * didMountRef skips the initial announcement: the welcome screen is
 * already visible on first paint, AT doesn't need a separate callout.
 */
export function useScreenChangeA11y<K extends string>(
  screen: K,
  labels: Record<K, string>
): Result {
  const containerRef = useCallback((node: HTMLElement | null) => {
    if (node) node.focus();
  }, []);

  // labels is expected to be a stable reference (module-scope literal).
  // The trigger we care about is screen change, not labels-object
  // identity, so we read labels via a ref to keep it out of deps.
  const labelsRef = useRef(labels);
  labelsRef.current = labels;

  const [announcement, setAnnouncement] = useState("");
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    setAnnouncement(labelsRef.current[screen]);
  }, [screen]);

  return { containerRef, announcement };
}
