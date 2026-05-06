"use client";

import { motion } from "framer-motion";
import { useWizard } from "@/lib/store";
import { buildSelectionBrief } from "@/lib/recommendation";
import { PURPOSES, DISCOMFORTS } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { useEffect, useMemo, useState } from "react";
import { saveConsultation, makeTicket } from "@/lib/storage";

type ShareStatus = "" | "shared" | "copied" | "failed";

export function StaffScreen() {
  const purposes = useWizard((s) => s.purposes);
  const discomforts = useWizard((s) => s.discomforts);
  const primaryConcern = useWizard((s) => s.primaryConcern);
  const prescription = useWizard((s) => s.prescription);
  const lensType = useWizard((s) => s.lensType);
  const selectedIndex = useWizard((s) => s.selectedIndex);
  const coatings = useWizard((s) => s.coatings);
  const singleTarget = useWizard((s) => s.singleTarget);
  const storedTicket = useWizard((s) => s.ticket);
  const setTicket = useWizard((s) => s.setTicket);
  const reset = useWizard((s) => s.reset);

  const [ticket] = useState(() => storedTicket ?? makeTicket());

  useEffect(() => {
    if (!storedTicket) setTicket(ticket);
  }, [storedTicket, setTicket, ticket]);

  const brief = useMemo(
    () => buildSelectionBrief(lensType, selectedIndex, coatings),
    [lensType, selectedIndex, coatings]
  );

  const staffBriefText = useMemo(
    () => buildStaffBrief({ purposes, discomforts, primaryConcern, brief }),
    [purposes, discomforts, primaryConcern, brief]
  );

  // Plain-text payload the customer can save off-app as a backup of
  // their pre-visit selection. Web Share / clipboard both consume this.
  const shareText = useMemo(
    () =>
      [
        "LensGuide 상담 결과",
        "",
        `[상담 번호] ${ticket}`,
        staffBriefText,
        "",
        "* 매장 방문 시 직원에게 보여주세요",
        "* 본 결과는 시력 검사를 대체하지 않습니다",
      ].join("\n"),
    [ticket, staffBriefText]
  );

  const [shareStatus, setShareStatus] = useState<ShareStatus>("");

  // Auto-clear so re-tapping the share button re-fires the aria-live
  // announcement. Without this, identical consecutive statuses don't
  // diff and AT stays silent on the second confirmation.
  useEffect(() => {
    if (!shareStatus) return;
    const id = window.setTimeout(() => setShareStatus(""), 4000);
    return () => window.clearTimeout(id);
  }, [shareStatus]);

  const handleShare = async () => {
    if (typeof navigator === "undefined") return;

    // Prefer the native share sheet — gives users iOS/Android-native
    // entry points (Notes, Messages, AirDrop, Mail, etc.) instead of
    // forcing the brief through clipboard middleware.
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "LensGuide 상담 결과",
          text: shareText,
        });
        setShareStatus("shared");
        return;
      } catch (err) {
        const name = (err as { name?: string } | null)?.name;
        // User dismissed the share sheet — treat as a no-op rather
        // than an error so we don't pollute aria-live.
        if (name === "AbortError") return;
        // Other failure (e.g., NotAllowedError on insecure context).
        // Fall through to clipboard backup.
      }
    }

    if (
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function"
    ) {
      try {
        await navigator.clipboard.writeText(shareText);
        setShareStatus("copied");
        return;
      } catch {
        /* fall through to failed */
      }
    }

    setShareStatus("failed");
  };

  // persist completed consultation once on mount
  useEffect(() => {
    saveConsultation({
      ticket,
      createdAt: new Date().toISOString(),
      purposes,
      discomforts,
      primaryConcern,
      prescription,
      lensType,
      selectedIndex,
      coatings,
      brief,
      demoSingleTarget: lensType === "single" ? singleTarget : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="absolute inset-0 grid place-items-center px-5 sm:px-8 py-6 sm:py-10 overflow-y-auto overscroll-contain">
      <div className="w-full max-w-3xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
          className="rounded-3xl sm:rounded-[40px] bg-white shadow-elevated overflow-hidden border border-ink-50"
        >
          {/* check */}
          <div className="relative px-5 sm:px-10 pt-10 sm:pt-12 pb-6 sm:pb-8 text-center">
            <motion.div
              aria-hidden="true"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 250, damping: 18, delay: 0.15 }}
              className="mx-auto w-20 h-20 rounded-full bg-accent-mint grid place-items-center shadow-[0_12px_32px_rgba(0,200,150,0.35)]"
            >
              <motion.svg
                width="36"
                height="36"
                viewBox="0 0 36 36"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <motion.path
                  d="M9 18l6 6 12-12"
                  stroke="white"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                />
              </motion.svg>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="mt-6 text-headline tracking-tight text-ink-900"
            >
              상담 내용을 정리했어요
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="mt-2 text-ink-500 text-balance"
            >
              매장 방문 시 이 화면을 직원에게 보여주세요.
            </motion.p>
          </div>

          {/* ticket */}
          <div
            className="relative px-5 sm:px-10 py-6 sm:py-8 border-y border-dashed border-ink-100"
            style={{
              background:
                "repeating-linear-gradient(45deg, transparent 0 12px, rgba(49,130,246,0.03) 12px 24px)",
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 sm:items-center">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                  상담 번호
                </div>
                <div className="mt-1 font-num text-2xl font-bold text-ink-900 tracking-tight">
                  #{ticket.split("-").slice(-1)[0]}
                </div>
                <div className="text-[10px] text-ink-400 font-num tracking-wider mt-0.5">
                  {ticket}
                </div>
              </div>
              <div className="text-center sm:col-span-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                  내가 고른 구성
                </div>
                <div className="mt-1 text-base font-bold text-ink-900">
                  {brief}
                </div>
              </div>
            </div>
          </div>

          {/* staff brief */}
          <div className="px-5 sm:px-10 py-6 sm:py-7">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-2">
              직원용 한 줄 브리프
            </div>
            <div className="p-5 rounded-2xl bg-ink-900 text-white">
              <div className="text-base font-medium leading-relaxed">
                {staffBriefText}
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={handleShare}
                aria-label="결과를 휴대폰에 저장하거나 공유하기"
              >
                <svg
                  aria-hidden="true"
                  width="18"
                  height="18"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="mr-2"
                >
                  <path
                    d="M10 3v9m0-9L7 6m3-3l3 3M5 12v3a2 2 0 002 2h6a2 2 0 002-2v-3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                결과 저장하기
              </Button>
              <Button variant="secondary" size="lg" onClick={reset}>
                처음으로
              </Button>
            </div>
            <div
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="mt-3 text-center text-xs text-ink-500 leading-relaxed min-h-[1.25rem]"
            >
              {shareStatus === "shared" &&
                "결과를 저장했어요. 매장에서 직원에게 보여주세요."}
              {shareStatus === "copied" &&
                "결과를 클립보드에 복사했어요. 메모 등에 붙여넣을 수 있어요."}
              {shareStatus === "failed" &&
                "공유에 실패했어요. 화면 캡처로 대신 저장해주세요."}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 text-center text-xs text-ink-400"
        >
          이 안내는 시력 검사를 대체하지 않으며, 정확한 처방은 매장 검안 후 결정됩니다.
        </motion.div>
      </div>
    </div>
  );
}

function buildStaffBrief({
  purposes,
  discomforts,
  primaryConcern,
  brief,
}: {
  purposes: string[];
  discomforts: string[];
  primaryConcern: string | null;
  brief: string;
}) {
  const purposeLabels = purposes
    .map((p) => PURPOSES.find((x) => x.id === p)?.label.replace(/요\.?$/, ""))
    .filter(Boolean)
    .slice(0, 2)
    .join(", ");

  const concern = primaryConcern
    ? DISCOMFORTS.find((d) => d.id === primaryConcern)?.label
    : null;

  const parts = [
    purposeLabels && `사용 패턴: ${purposeLabels}`,
    concern && `주요 고민: ${concern}`,
    `구성: ${brief}`,
  ].filter(Boolean);

  return parts.join(" · ");
}
