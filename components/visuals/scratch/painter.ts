// Per-frame canvas painters for the scratch lab. Pure with respect to
// THREE — they only touch HTMLCanvasElement and 2D contexts so the
// drawing logic stays decoupled from the R3F render loop.

import { SPARK_LIFE, TEX_H, TEX_W, type Spark, type Stroke } from "./types";

// Returns true if the canvas was drawn so the caller can gate the
// CanvasTexture's needsUpdate flag — skip the GPU re-upload when the
// 2D context was unavailable (already requested as a different type).
export function drawScratches(
  canvas: HTMLCanvasElement,
  strokes: Stroke[]
): boolean {
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;

  ctx.clearRect(0, 0, TEX_W, TEX_H);
  ctx.fillStyle = "rgba(252,165,165,0.07)";
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const stroke of strokes) {
    if (stroke.points.length === 0) continue;
    // Single-point stroke (a tap with no drag) — Canvas2D's `stroke`
    // on a path that only has `moveTo` draws nothing, so a tap used
    // to silently disappear. Render it as a small impact divot.
    if (stroke.points.length === 1) {
      const p = stroke.points[0];
      ctx.fillStyle = "rgba(15,23,42,0.18)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(15,23,42,0.95)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.beginPath();
      ctx.arc(p.x - 0.9, p.y - 0.9, 0.9, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }
    // Soft outer halo — like the lens micro-fracture haze around
    // a deep groove. Drawn first so the dark groove sits on top.
    ctx.strokeStyle = "rgba(15,23,42,0.18)";
    ctx.lineWidth = 8;
    ctx.beginPath();
    stroke.points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
    // Main groove — much darker and wider than before so it reads
    // through the translucent substrate instead of disappearing.
    ctx.strokeStyle = "rgba(15,23,42,0.95)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    stroke.points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
    // Bright sliver above the groove for cut-glass feel.
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    stroke.points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x - 1.2, p.y - 1.2);
      else ctx.lineTo(p.x - 1.2, p.y - 1.2);
    });
    ctx.stroke();
  }
  return true;
}

export function drawSparks(
  canvas: HTMLCanvasElement,
  sparks: Spark[],
  now: number
): boolean {
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;

  ctx.clearRect(0, 0, TEX_W, TEX_H);
  ctx.fillStyle = "rgba(110,231,183,0.07)";
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  for (const spark of sparks) {
    const age = Math.max(0, Math.min(1, (now - spark.bornAt) / SPARK_LIFE));
    const alpha = 1 - age;
    const radius = Math.max(0.5, 18 + age * 30);

    const grad = ctx.createRadialGradient(
      spark.x,
      spark.y,
      0,
      spark.x,
      spark.y,
      radius
    );
    grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
    grad.addColorStop(0.35, `rgba(167,243,208,${alpha * 0.7})`);
    grad.addColorStop(1, "rgba(167,243,208,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(
      spark.x - radius,
      spark.y - radius,
      radius * 2,
      radius * 2
    );

    ctx.strokeStyle = `rgba(34,197,94,${alpha * 0.7})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(spark.x, spark.y, radius * 0.85, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + age * 4;
      const r = radius * (0.6 + age * 0.5);
      const sx = spark.x + Math.cos(angle) * r;
      const sy = spark.y + Math.sin(angle) * r;
      ctx.fillStyle = `rgba(255,255,255,${alpha * 0.9})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  return true;
}
