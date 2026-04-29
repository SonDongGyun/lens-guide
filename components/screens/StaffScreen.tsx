"use client";

import { motion } from "framer-motion";
import { useWizard } from "@/lib/store";
import { buildSelectionBrief } from "@/lib/recommendation";
import { PURPOSES, DISCOMFORTS } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { useEffect, useMemo, useState } from "react";
import { saveConsultation, makeTicket } from "@/lib/storage";

export function StaffScreen() {
  const purposes = useWizard((s) => s.purposes);
  const discomforts = useWizard((s) => s.discomforts);
  const primaryConcern = useWizard((s) => s.primaryConcern);
  const prescription = useWizard((s) => s.prescription);
  const lensType = useWizard((s) => s.lensType);
  const selectedIndex = useWizard((s) => s.selectedIndex);
  const coatings = useWizard((s) => s.coatings);
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
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="absolute inset-0 grid place-items-center px-10 py-10">
      <div className="w-full max-w-3xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
          className="rounded-[40px] bg-white shadow-elevated overflow-hidden border border-ink-50"
        >
          {/* check */}
          <div className="relative px-10 pt-12 pb-8 text-center">
            <motion.div
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
              이 화면을 직원에게 보여주세요.
            </motion.p>
          </div>

          {/* ticket */}
          <div
            className="relative px-10 py-8 border-y border-dashed border-ink-100"
            style={{
              background:
                "repeating-linear-gradient(45deg, transparent 0 12px, rgba(49,130,246,0.03) 12px 24px)",
            }}
          >
            <div className="grid grid-cols-3 gap-4 items-center">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                  상담 번호
                </div>
                <div className="mt-1 font-num text-2xl font-bold text-ink-900 tracking-tight">
                  #{ticket.split("-").slice(-1)[0]}
                </div>
                <div className="text-[10px] text-ink-300 font-num tracking-wider mt-0.5">
                  {ticket}
                </div>
              </div>
              <div className="text-center col-span-2">
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
          <div className="px-10 py-7">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-2">
              직원용 한 줄 브리프
            </div>
            <div className="p-5 rounded-2xl bg-ink-900 text-white">
              <div className="text-base font-medium leading-relaxed">
                {buildStaffBrief({
                  purposes,
                  discomforts,
                  primaryConcern,
                  brief,
                })}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center">
              <Button variant="secondary" size="lg" onClick={reset}>
                처음으로
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 text-center text-xs text-ink-300"
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
