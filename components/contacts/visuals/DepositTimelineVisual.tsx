"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

// Visualises 30 days of "deposit" build-up (단백질·지방 침착) on a
// contact lens for each replacement schedule. Daily lenses stay
// near zero — every cell is a fresh lens. Biweekly lenses climb
// twice over the month, snapping back to mint at each replacement.
// Monthly lenses climb steadily without a reset until day 30.
//
// The animation pauses when the canvas leaves the viewport and
// falls back to a static frame when the user prefers reduced
// motion — the static frame already carries the full message,
// so no information is hidden.

const W = 720;
const H = 240;
const PAD_L = 20;
const PAD_R = 20;
const PAD_T = 36;
const PAD_B = 36;
const LABEL_W = 84;
const CELL_AREA_X = PAD_L + LABEL_W;
const CELL_AREA_W = W - PAD_R - CELL_AREA_X;
const N_CELLS = 30;
const CELL_W = 18;
const CELL_GAP = 1;
const TOTAL_CELLS_W = N_CELLS * CELL_W + (N_CELLS - 1) * CELL_GAP;
const CELL_X0 = CELL_AREA_X + Math.round((CELL_AREA_W - TOTAL_CELLS_W) / 2);
const CELL_X1 = CELL_X0 + TOTAL_CELLS_W;

const ROW_H = 32;
const ROWS_Y0 = PAD_T + 8;
const ROW_STRIDE = 50;
const SWEEP_MS = 12000;

interface RowSpec {
  id: "daily" | "biweekly" | "monthly";
  label: string;
  // 1-indexed day → deposit 0..1
  deposit: (day: number) => number;
  // day numbers AFTER which a replacement marker is drawn
  // (between day d and d+1)
  resetsAfter: number[];
}

const ROWS: RowSpec[] = [
  {
    id: "daily",
    label: "1일",
    // Always a fresh lens — keep a faint mint baseline so the row
    // reads as "filled with cells" rather than "empty"
    deposit: () => 0.04,
    resetsAfter: [],
  },
  {
    id: "biweekly",
    label: "2주",
    deposit: (d) => ((d - 1) % 14) / 13,
    resetsAfter: [14, 28],
  },
  {
    id: "monthly",
    label: "1개월",
    deposit: (d) => (d - 1) / 29,
    resetsAfter: [],
  },
];

export function DepositTimelineVisual() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const renderStatic = () => {
      drawBackground(ctx);
      for (let r = 0; r < ROWS.length; r++) drawRow(ctx, ROWS[r], r);
      drawAxis(ctx);
    };

    if (reduced) {
      renderStatic();
      return;
    }

    let running = true;
    let visible = true;
    let frameId = 0;
    let started = performance.now();

    const io = wrapperRef.current
      ? new IntersectionObserver(
          ([entry]) => {
            visible = entry.isIntersecting;
            if (visible) {
              started = performance.now();
              schedule();
            }
          },
          { threshold: 0.1 }
        )
      : null;
    if (io && wrapperRef.current) io.observe(wrapperRef.current);

    const tick = (now: number) => {
      if (!running) return;
      const t = ((now - started) % SWEEP_MS) / SWEEP_MS;
      renderStatic();
      drawCursor(ctx, t);
      if (visible) frameId = requestAnimationFrame(tick);
    };

    const schedule = () => {
      if (!running) return;
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(tick);
    };

    schedule();

    return () => {
      running = false;
      cancelAnimationFrame(frameId);
      if (io) io.disconnect();
    };
  }, [reduced]);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="30일 침착물 누적 비교: 원데이는 거의 없음, 2주용은 두 번 누적되었다 초기화, 한달용은 천천히 가장 높게 누적"
        className="block w-full h-auto"
        style={{ aspectRatio: `${W} / ${H}` }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-4 sm:px-5 pt-3 sm:pt-4"
      >
        <div className="text-[11px] sm:text-xs font-bold tracking-wider uppercase text-ink-700">
          30일 침착물 누적
        </div>
        <div className="flex items-center gap-2.5 text-[10px] sm:text-xs text-ink-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-accent-mint" />
            깨끗
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-accent-coral" />
            누적
          </span>
        </div>
      </div>
    </div>
  );
}

function lerpColor(t: number, alpha = 1): string {
  const tt = Math.max(0, Math.min(1, t));
  // mint #00C896 (0,200,150) → coral #FF6B6B (255,107,107)
  const r = Math.round(0 + (255 - 0) * tt);
  const g = Math.round(200 + (107 - 200) * tt);
  const b = Math.round(150 + (107 - 150) * tt);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function dayCellX(day: number): number {
  return CELL_X0 + (day - 1) * (CELL_W + CELL_GAP);
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#FAFBFD";
  ctx.fillRect(0, 0, W, H);
}

function drawRow(ctx: CanvasRenderingContext2D, row: RowSpec, idx: number) {
  const y = ROWS_Y0 + idx * ROW_STRIDE;

  // row label
  ctx.fillStyle = "#333D4B";
  ctx.font =
    "600 13px ui-sans-serif, system-ui, -apple-system, 'Pretendard', sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(row.label, PAD_L, y + ROW_H / 2);

  // cells
  for (let d = 1; d <= N_CELLS; d++) {
    const level = row.deposit(d);
    ctx.fillStyle = lerpColor(level, 0.92);
    const x = dayCellX(d);
    roundRect(ctx, x, y, CELL_W, ROW_H, 3);
    ctx.fill();
  }

  // replacement markers
  for (const d of row.resetsAfter) {
    if (d < 1 || d >= N_CELLS) continue;
    const xRight = dayCellX(d) + CELL_W;
    const xNext = dayCellX(d + 1);
    const xMid = (xRight + xNext) / 2;
    ctx.save();
    ctx.strokeStyle = "rgba(15, 23, 42, 0.55)";
    ctx.lineWidth = 1.4;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(xMid, y - 6);
    ctx.lineTo(xMid, y + ROW_H + 6);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = "rgba(15, 23, 42, 0.6)";
    ctx.font =
      "600 9px ui-sans-serif, system-ui, -apple-system, 'Pretendard', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("교체", xMid, y - 7);
  }
}

function drawAxis(ctx: CanvasRenderingContext2D) {
  const y = H - PAD_B + 6;
  ctx.strokeStyle = "rgba(15, 23, 42, 0.1)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(CELL_X0, y);
  ctx.lineTo(CELL_X1, y);
  ctx.stroke();

  ctx.fillStyle = "rgba(15, 23, 42, 0.55)";
  ctx.font =
    "500 10px ui-sans-serif, system-ui, -apple-system, 'Pretendard', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  for (const d of [1, 7, 14, 21, 30]) {
    const x = dayCellX(d) + CELL_W / 2;
    ctx.strokeStyle = "rgba(15, 23, 42, 0.25)";
    ctx.beginPath();
    ctx.moveTo(x, y - 3);
    ctx.lineTo(x, y + 2);
    ctx.stroke();
    ctx.fillText(`${d}일`, x, y + 6);
  }
}

function drawCursor(ctx: CanvasRenderingContext2D, t: number) {
  const x = CELL_X0 + t * TOTAL_CELLS_W;
  const yTop = ROWS_Y0 - 8;
  const yBot = ROWS_Y0 + (ROWS.length - 1) * ROW_STRIDE + ROW_H + 6;

  ctx.save();
  // soft aura
  const grad = ctx.createLinearGradient(x - 22, 0, x + 22, 0);
  grad.addColorStop(0, "rgba(49, 130, 246, 0)");
  grad.addColorStop(0.5, "rgba(49, 130, 246, 0.16)");
  grad.addColorStop(1, "rgba(49, 130, 246, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(x - 22, yTop, 44, yBot - yTop);

  // line
  ctx.strokeStyle = "rgba(49, 130, 246, 0.85)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, yTop);
  ctx.lineTo(x, yBot);
  ctx.stroke();

  // tip dots above each row
  ctx.fillStyle = "#3182F6";
  ctx.beginPath();
  ctx.arc(x, yTop, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
