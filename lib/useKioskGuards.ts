"use client";

import { useEffect, useRef } from "react";

/**
 * Decide what the popstate handler should do given the current state.
 * Pure function so the rules can be exercised without a DOM.
 *
 *  - consume-guard:   we just synthesized our own back() — clear flags
 *                     and stop, the navigation has already settled.
 *  - exit-welcome:    no sentinel is supposed to be active on welcome,
 *                     let the back gesture exit the page.
 *  - go-prev:         user-initiated back on a non-welcome screen,
 *                     map it to wizard.prev().
 */
export type PopAction = "consume-guard" | "exit-welcome" | "go-prev";
export function decidePopAction(
  popGuardActive: boolean,
  isWelcome: boolean
): PopAction {
  if (popGuardActive) return "consume-guard";
  if (isWelcome) return "exit-welcome";
  return "go-prev";
}

/**
 * Decide what the screen-sync effect should do given the current
 * (screen, sentinel) state. Welcome holds zero sentinels; non-welcome
 * holds exactly one.
 *
 *  - consume-leftover:  arrived at welcome via the in-app footer with
 *                       a sentinel still on the stack — pop it via
 *                       history.back() guarded by popGuard.
 *  - claim-existing:    refresh preserved our pushState entry; we
 *                       just need to remember we already own it.
 *  - push-new:          first time arriving on a non-welcome screen
 *                       (or after consuming the previous one) — push
 *                       a fresh sentinel.
 *  - no-op:             welcome with no sentinel, or non-welcome
 *                       with the sentinel already locally tracked.
 */
export type SyncAction =
  | "consume-leftover"
  | "claim-existing"
  | "push-new"
  | "no-op";
export function decideSyncAction(
  isWelcome: boolean,
  sentinelLocallySet: boolean,
  historyEntryIsSentinel: boolean
): SyncAction {
  if (isWelcome) {
    return sentinelLocallySet ? "consume-leftover" : "no-op";
  }
  if (sentinelLocallySet) return "no-op";
  if (historyEntryIsSentinel) return "claim-existing";
  return "push-new";
}

interface KioskGuardsArgs {
  /** Current wizard screen id (subscribed by the caller). */
  screen: string;
  /** The id that represents the entry/exit screen — backstop for
   *  history sentinel management. Different wizards use different
   *  literal types, so we accept any string. */
  welcomeScreen: string;
  /** Step-back action invoked when the user presses the system back
   *  button on a non-welcome screen. */
  prev: () => void;
}

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
 * The hook is wizard-agnostic: callers pass in their store's
 * subscribed screen value, the welcome-screen literal, and a prev
 * callback. This lets a single implementation back both the
 * eyeglass and contact-lens flows without code drift.
 */
export function useKioskGuards({ screen, welcomeScreen, prev }: KioskGuardsArgs) {
  const sentinelRef = useRef(false);
  // Set to true right before we synthetically pop our own sentinel so
  // the popstate handler can tell user-initiated back from our own
  // cleanup pop and skip prev() in the latter case.
  const popGuardRef = useRef(false);

  // Stash latest args so the popstate handler — attached once on
  // mount — always reads fresh values across re-renders.
  const argsRef = useRef({ screen, welcomeScreen, prev });
  useEffect(() => {
    argsRef.current = { screen, welcomeScreen, prev };
  });

  // Always-attached popstate listener so welcome ↔ non-welcome
  // transitions never miss an event. The sync effect below manages
  // sentinel push/pop independently.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onPop = () => {
      const { screen: cur, welcomeScreen: w, prev: doPrev } = argsRef.current;
      const action = decidePopAction(popGuardRef.current, cur === w);
      switch (action) {
        case "consume-guard":
          popGuardRef.current = false;
          sentinelRef.current = false;
          return;
        case "exit-welcome":
          return;
        case "go-prev":
          sentinelRef.current = false;
          doPrev();
          return;
      }
    };

    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Keep the sentinel state aligned with the current wizard screen.
  // The decision rule lives in decideSyncAction; this effect just
  // dispatches its result.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const cur = window.history.state as { wizard?: boolean } | null;
    const action = decideSyncAction(
      screen === welcomeScreen,
      sentinelRef.current,
      !!(cur && cur.wizard === true)
    );

    switch (action) {
      case "consume-leftover":
        popGuardRef.current = true;
        window.history.back();
        // sentinelRef will be cleared by the consume-guard branch in onPop.
        return;
      case "claim-existing":
        sentinelRef.current = true;
        return;
      case "push-new":
        window.history.pushState({ wizard: true }, "", window.location.href);
        sentinelRef.current = true;
        return;
      case "no-op":
        return;
    }
  }, [screen, welcomeScreen]);
}
