"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

// O₂ permeability comparison: two side-by-side cross-sections.
// Particles spawn above each material at the same rate; the
// per-side pass-through rate differs (hydrogel ~25%, silicone
// ~85%), so the lower half visibly accumulates more particles
// on the silicone side. The simulation is paused when the
// canvas leaves the viewport so it doesn't drain mobile battery
// while the user is reading text further down the page.

interface Particle {
  active: boolean;
  side: 0 | 1; // 0 = hydrogel (left), 1 = silicone hydrogel (right)
  x: number;
  y: number;
  vy: number;
  alpha: number;
  // null = still falling toward the surface; once reached,
  // becomes 0..1 progress through the material when willPass.
  passing: number | null;
  willPass: boolean | null;
}

const W = 800;
const H = 320;
const PANEL_W = W / 2;
const PANEL_PAD_X = 32;
const SKY_TOP = 24;
const LENS_TOP = 130;
const LENS_BOTTOM = 210;
const CORNEA_TOP = LENS_BOTTOM + 6;

// ~25% vs ~85% — these aren't precise Dk numbers, but the spread
// matches the qualitative difference (silicone hydrogel ≈ 5–8x
// the oxygen transmission of legacy hydrogel at typical thickness).
const PASS_RATES: readonly [number, number] = [0.25, 0.85];

const FALL_VY = 90;
const SPAWN_INTERVAL_MS = 110;
const PARTICLE_POOL = 140;

export function OxygenFlowVisual() {
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

    if (reduced) {
      drawBackground(ctx);
      drawStaticSnapshot(ctx);
      drawForeground(ctx);
      return;
    }

    const particles: Particle[] = Array.from(
      { length: PARTICLE_POOL },
      () => ({
        active: false,
        side: 0,
        x: 0,
        y: 0,
        vy: 0,
        alpha: 0,
        passing: null,
        willPass: null,
      })
    );

    let running = true;
    let visible = true;
    let lastSpawn = 0;
    let lastTime = performance.now();
    let frameId = 0;

    const io = wrapperRef.current
      ? new IntersectionObserver(
          ([entry]) => {
            visible = entry.isIntersecting;
            if (visible) {
              lastTime = performance.now();
              schedule();
            }
          },
          { threshold: 0.1 }
        )
      : null;
    if (io && wrapperRef.current) io.observe(wrapperRef.current);

    const spawn = (side: 0 | 1) => {
      const slot = particles.find((p) => !p.active);
      if (!slot) return;
      slot.active = true;
      slot.side = side;
      const baseX = side === 0 ? 0 : PANEL_W;
      slot.x =
        baseX + PANEL_PAD_X + Math.random() * (PANEL_W - PANEL_PAD_X * 2);
      slot.y = SKY_TOP + Math.random() * 8;
      slot.vy = FALL_VY * (0.85 + Math.random() * 0.4);
      slot.alpha = 0;
      slot.passing = null;
      slot.willPass = null;
    };

    const update = (dt: number, now: number) => {
      if (now - lastSpawn > SPAWN_INTERVAL_MS) {
        spawn(0);
        spawn(1);
        lastSpawn = now;
      }

      for (const p of particles) {
        if (!p.active) continue;
        // Fade-in
        p.alpha = Math.min(1, p.alpha + dt * 4);

        if (p.willPass === null) {
          p.y += p.vy * dt;
          if (p.y >= LENS_TOP) {
            p.willPass = Math.random() < PASS_RATES[p.side];
            p.passing = p.willPass ? 0 : null;
          }
        } else if (p.willPass) {
          if (p.passing! < 1) {
            // diffusing through the lens body — slower
            p.passing = Math.min(1, p.passing! + dt * 0.55);
            p.y = LENS_TOP + p.passing * (LENS_BOTTOM - LENS_TOP);
          } else {
            // exited into cornea region
            p.y += p.vy * dt * 0.6;
            if (p.y > H - 8) {
              p.alpha -= dt * 2.5;
              if (p.alpha <= 0) p.active = false;
            }
          }
        } else {
          // Blocked: slight upward bounce then fade out
          p.alpha -= dt * 2;
          p.y -= dt * 14;
          if (p.alpha <= 0) p.active = false;
        }
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, W, H);
      drawBackground(ctx);

      for (const p of particles) {
        if (!p.active) continue;
        const passedLens = p.willPass && p.passing! >= 1;
        const inLens = p.willPass && p.passing !== null && p.passing < 1;
        const blocked = p.willPass === false;
        const color = blocked
          ? `rgba(255, 107, 107, ${p.alpha * 0.7})`
          : passedLens
            ? `rgba(0, 200, 150, ${p.alpha})`
            : inLens
              ? `rgba(123, 97, 255, ${p.alpha})`
              : `rgba(49, 130, 246, ${p.alpha})`;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }

      drawForeground(ctx);
    };

    const tick = (now: number) => {
      if (!running) return;
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      update(dt, now);
      render();
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
        aria-label="산소투과 비교: 실리콘 하이드로겔이 하이드로겔보다 훨씬 많은 산소를 통과시킵니다"
        className="block w-full h-auto rounded-2xl sm:rounded-3xl"
        style={{ aspectRatio: `${W} / ${H}` }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grid grid-cols-2"
      >
        <div className="flex flex-col justify-between p-3 sm:p-5">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold tracking-wider uppercase text-ink-700">
            <span className="w-1.5 h-1.5 rounded-full bg-ink-500" />
            하이드로겔
          </div>
          <div className="text-[10px] sm:text-xs text-ink-400">
            산소 통과율 <span className="font-num text-ink-700">~25%</span>
          </div>
        </div>
        <div className="flex flex-col justify-between p-3 sm:p-5 text-right">
          <div className="flex items-center gap-2 justify-end text-[11px] sm:text-xs font-bold tracking-wider uppercase text-brand">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            실리콘 하이드로겔
          </div>
          <div className="text-[10px] sm:text-xs text-ink-400">
            산소 통과율 <span className="font-num text-brand">~85%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  // upper "air / tear film" region
  const skyGrad = ctx.createLinearGradient(0, 0, 0, LENS_TOP);
  skyGrad.addColorStop(0, "#F8FAFC");
  skyGrad.addColorStop(1, "#EEF2FE");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, LENS_TOP);

  // hydrogel lens body (left)
  ctx.fillStyle = "rgba(190, 220, 200, 0.55)";
  roundRect(ctx, 16, LENS_TOP, PANEL_W - 32, LENS_BOTTOM - LENS_TOP, 16);
  ctx.fill();

  // silicone hydrogel lens body (right)
  ctx.fillStyle = "rgba(180, 200, 250, 0.55)";
  roundRect(
    ctx,
    PANEL_W + 16,
    LENS_TOP,
    PANEL_W - 32,
    LENS_BOTTOM - LENS_TOP,
    16
  );
  ctx.fill();

  // cornea region (eye-side)
  const corneaGrad = ctx.createLinearGradient(0, CORNEA_TOP, 0, H);
  corneaGrad.addColorStop(0, "#E0E7FF");
  corneaGrad.addColorStop(1, "#C7D2FE");
  ctx.fillStyle = corneaGrad;
  ctx.fillRect(0, CORNEA_TOP, W, H - CORNEA_TOP);

  // panel separator
  ctx.strokeStyle = "rgba(15, 23, 42, 0.06)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PANEL_W, 0);
  ctx.lineTo(PANEL_W, H);
  ctx.stroke();
}

function drawForeground(ctx: CanvasRenderingContext2D) {
  // "EYE / 각막" hint at bottom
  ctx.fillStyle = "rgba(15, 23, 42, 0.45)";
  ctx.font =
    "bold 11px ui-sans-serif, system-ui, -apple-system, 'Pretendard', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("각막 ↓ 산소 도달", PANEL_W / 2, H - 14);
  ctx.fillText("각막 ↓ 산소 도달", PANEL_W + PANEL_W / 2, H - 14);
}

function drawStaticSnapshot(ctx: CanvasRenderingContext2D) {
  // Reduced-motion fallback — paint particles in fixed positions
  // representing each material's typical permeability.
  const positions: { x: number; y: number; pass: boolean; side: 0 | 1 }[] = [];
  // hydrogel side: many blocked above lens, few in cornea
  for (let i = 0; i < 12; i++) {
    positions.push({
      x: 60 + ((i * 23) % (PANEL_W - 120)),
      y: 60 + (i % 3) * 12,
      pass: false,
      side: 0,
    });
  }
  for (let i = 0; i < 3; i++) {
    positions.push({
      x: 100 + i * 85,
      y: H - 50,
      pass: true,
      side: 0,
    });
  }
  // silicone side: many in cornea, few blocked
  for (let i = 0; i < 4; i++) {
    positions.push({
      x: PANEL_W + 80 + i * 55,
      y: 70,
      pass: false,
      side: 1,
    });
  }
  for (let i = 0; i < 12; i++) {
    positions.push({
      x: PANEL_W + 60 + ((i * 27) % (PANEL_W - 120)),
      y: H - 60 + (i % 3) * 14,
      pass: true,
      side: 1,
    });
  }

  for (const p of positions) {
    ctx.fillStyle = p.pass
      ? "rgba(0, 200, 150, 0.85)"
      : "rgba(255, 107, 107, 0.6)";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
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
