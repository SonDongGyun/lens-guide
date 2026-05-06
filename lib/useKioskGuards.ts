"use client";

import { useEffect, useRef } from "react";
import { useWizard } from "./store";

/**
 * Wires history-back interception so the system back gesture maps
 * to wizard.prev() on non-welcome screens. On welcome we keep no
 * sentinel — back exits the page in a single press, matching mobile
 * expectations.
 *
 * Idle auto-reset was intentionally removed. This is a pre-visit
 * mobile experience: users may put the phone down mid-flow, answer
 * a call, switch apps for minutes at a time. Wiping state under
 * them would punish exactly the patient reading we want to encourage.
 * Cross-session resume is now covered by zustand persist (24h TTL).
 *
 * The hook keeps its name for the file's external surface but no
 * longer enforces "kiosk" semantics — see useWizard's persist config
 * and the Welcome screen for the new pre-visit framing.
 */
export function useKioskGuards() {
  const screen = useWizard((s) => s.screen);
  const sentinelRef = useRef(false);
  // Set to true right before we synthetically pop our own sentinel so
  // the popstate handler can tell user-initiated back from our own
  // cleanup pop and skip prev() in the latter case.
  const popGuardRef = useRef(false);

  // Always-attached popstate listener so welcome ↔ non-welcome
  // transitions never miss an event. The sync effect below manages
  // sentinel push/pop independently.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onPop = () => {
      if (popGuardRef.current) {
        popGuardRef.current = false;
        sentinelRef.current = false;
        return;
      }
      if (useWizard.getState().screen === "welcome") {
        // No sentinel is supposed to be active on welcome; let the
        // navigation propagate so back exits the page.
        return;
      }
      sentinelRef.current = false;
      useWizard.getState().prev();
    };

    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Keep the sentinel state aligned with the current wizard screen.
  //  - welcome      → no sentinel (single back press exits the page)
  //  - non-welcome  → exactly one sentinel on top of history
  //
  // When transitioning back to welcome from a non-welcome screen via
  // the in-app footer ("이전"), there is a leftover sentinel we
  // pushed earlier. We consume it via history.back() guarded with
  // popGuardRef so the popstate handler doesn't run prev() again.
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (screen === "welcome") {
      if (sentinelRef.current) {
        popGuardRef.current = true;
        window.history.back();
        // sentinelRef will be cleared by the popGuard branch in onPop.
      }
      return;
    }

    // If the current history entry is already our sentinel — for
    // example, after a page refresh that preserved our pushed entry —
    // don't double-push. Just claim it.
    const cur = window.history.state as { wizard?: boolean } | null;
    const alreadySentinel = !!(cur && cur.wizard === true);
    if (!sentinelRef.current && !alreadySentinel) {
      window.history.pushState({ wizard: true }, "", window.location.href);
    }
    sentinelRef.current = true;
  }, [screen]);
}
