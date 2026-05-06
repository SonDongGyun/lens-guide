"use client";

import { useEffect } from "react";
import { useWizard } from "@/lib/store";

// Next App Router catches uncaught render/effect errors here. For the
// kiosk we replace Next's English default with a Korean panel that
// resets the wizard store *and* re-mounts the route — so the next
// customer doesn't inherit a half-finished session.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (typeof console !== "undefined") {
      console.error("Kiosk render error:", error);
    }
  }, [error]);

  const restart = () => {
    useWizard.getState().reset();
    reset();
  };

  return (
    <div className="h-dvh w-screen grid place-items-center px-6 bg-bg-muted">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-elevated border border-ink-50 p-8 text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-rose-50 grid place-items-center text-rose-500 text-2xl font-bold">
          !
        </div>
        <h1 className="mt-5 text-2xl font-bold text-ink-900 tracking-tight">
          잠시 문제가 발생했어요
        </h1>
        <p className="mt-2 text-sm text-ink-500 leading-relaxed">
          처음 화면으로 돌아가서 다시 시도해 주세요. 같은 문제가 반복되면
          매장 직원에게 알려주세요.
        </p>
        <button
          onClick={restart}
          className="mt-6 w-full h-12 rounded-2xl bg-ink-900 text-white text-base font-bold tracking-tight"
        >
          처음으로
        </button>
      </div>
    </div>
  );
}
