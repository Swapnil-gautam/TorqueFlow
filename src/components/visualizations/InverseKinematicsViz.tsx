"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { VizErrorBoundary } from "./VizErrorBoundary";

const CANVAS_W = 500;
const CANVAS_H = 320;
const SCALE = 70;
/** World origin at the visual center of the canvas; +x right, +y up (same as Fwd Kinematics). */
const ORIGIN_X = CANVAS_W / 2;
const ORIGIN_Y = CANVAS_H / 2 + 20;

const SLIDER_MAX = 2;
const SLIDER_MIN = -2;
const SLIDER_STEP = 0.01;

function toScreen(x: number, y: number): [number, number] {
  return [ORIGIN_X + x * SCALE, ORIGIN_Y - y * SCALE];
}

function screenToWorld(sx: number, sy: number, rect: DOMRect): { x: number; y: number } {
  const mx = sx - rect.left;
  const my = sy - rect.top;
  const x = (mx - ORIGIN_X) / SCALE;
  const y = (ORIGIN_Y - my) / SCALE;
  return { x, y };
}

function solveIK(
  l1: number,
  l2: number,
  tx: number,
  ty: number
): { theta1: number; theta2: number; reachable: boolean } {
  const dist = tx * tx + ty * ty;
  const cosT2 = (dist - l1 * l1 - l2 * l2) / (2 * l1 * l2);
  if (Math.abs(cosT2) > 1) {
    return { theta1: 0, theta2: 0, reachable: false };
  }
  const theta2 = Math.atan2(Math.sqrt(1 - cosT2 * cosT2), cosT2);
  const theta1 =
    Math.atan2(ty, tx) -
    Math.atan2(l2 * Math.sin(theta2), l1 + l2 * Math.cos(theta2));
  return { theta1, theta2, reachable: true };
}

export default function InverseKinematicsViz() {
  const l1 = 1;
  const l2 = 0.8;
  const { rMin, rMax, maxAbs } = useMemo(() => {
    const r0 = Math.abs(l1 - l2);
    const r1 = l1 + l2;
    return { rMin: r0, rMax: r1, maxAbs: r1 };
  }, [l1, l2]);

  const [target, setTarget] = useState({ x: 1.0, y: -0.6 });
  const [dragging, setDragging] = useState(false);
  const draggingRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const { theta1, theta2, reachable } = solveIK(l1, l2, target.x, target.y);

  const setTargetClamped = useCallback((x: number, y: number) => {
    setTarget({
      x: Math.max(SLIDER_MIN, Math.min(SLIDER_MAX, x)),
      y: Math.max(SLIDER_MIN, Math.min(SLIDER_MAX, y)),
    });
  }, []);

  const moveFromEvent = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const r = canvas.getBoundingClientRect();
      const w = screenToWorld(clientX, clientY, r);
      setTargetClamped(w.x, w.y);
    },
    [setTargetClamped]
  );

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingRef.current = true;
    setDragging(true);
    moveFromEvent(e.clientX, e.clientY);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!draggingRef.current) return;
    moveFromEvent(e.clientX, e.clientY);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    draggingRef.current = false;
    setDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* not captured */
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_W * dpr;
    canvas.height = CANVAS_H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let running = true;
    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = "#0a0f0d";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      drawGrid(ctx);
      drawWorkspaceRing(ctx, rMin, rMax);
      if (reachable) {
        drawArm(ctx, theta1, theta2, l1, l2);
      }
      drawTarget(ctx, target.x, target.y, reachable, dragging);

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
    };
  }, [theta1, theta2, reachable, target.x, target.y, dragging, l1, l2, rMin, rMax, maxAbs]);

  return (
    <VizErrorBoundary>
      <div>
        <div className="flex border-b border-border-default bg-bg-primary">
          <div className="relative shrink-0" style={{ width: CANVAS_W, height: CANVAS_H }}>
            <canvas
              ref={canvasRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              className="block touch-none select-none"
              style={{
                width: CANVAS_W,
                height: CANVAS_H,
                cursor: dragging ? "grabbing" : "crosshair",
              }}
            />
            <div className="pointer-events-none absolute top-2 left-2 max-w-[min(220px,60%)] rounded-md bg-bg-primary/90 px-2 py-1 text-[10px] text-text-muted backdrop-blur-sm">
              Drag on the grid or use sliders. Origin at center: +x right, +y up.
            </div>
          </div>

          <div className="flex min-w-[11rem] flex-1 flex-col justify-center gap-3 border-l border-border-default bg-bg-secondary p-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
              Target
            </p>
            <div>
              <label className="mb-0.5 flex items-center justify-between text-xs text-text-secondary">
                <span className="font-mono">x</span>
                <span className="font-mono text-accent-green">{target.x.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min={SLIDER_MIN}
                max={SLIDER_MAX}
                step={SLIDER_STEP}
                value={target.x}
                onChange={(e) =>
                  setTargetClamped(parseFloat(e.target.value), target.y)
                }
                className="w-full accent-accent-green"
              />
            </div>
            <div>
              <label className="mb-0.5 flex items-center justify-between text-xs text-text-secondary">
                <span className="font-mono">y</span>
                <span className="font-mono text-accent-green">{target.y.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min={SLIDER_MIN}
                max={SLIDER_MAX}
                step={SLIDER_STEP}
                value={target.y}
                onChange={(e) =>
                  setTargetClamped(target.x, parseFloat(e.target.value))
                }
                className="w-full accent-accent-green"
              />
            </div>
            <div className="space-y-1.5 border-t border-border-default pt-2">
              <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
                Joint angles
              </p>
              {reachable ? (
                <>
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="text-text-secondary">θ₁</span>
                    <span className="font-mono tabular-nums text-accent-green">
                      {((theta1 * 180) / Math.PI).toFixed(1)}°
                      <span className="ml-1.5 text-[10px] font-normal text-text-muted">
                        ({theta1.toFixed(3)} rad)
                      </span>
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="text-text-secondary">θ₂</span>
                    <span className="font-mono tabular-nums text-accent-green">
                      {((theta2 * 180) / Math.PI).toFixed(1)}°
                      <span className="ml-1.5 text-[10px] font-normal text-text-muted">
                        ({theta2.toFixed(3)} rad)
                      </span>
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-xs text-error">Unreachable — no IK solution for this target.</p>
              )}
            </div>
            <div className="mt-1 space-y-1.5 border-t border-border-default pt-2 text-[10px] text-text-muted">
              <p className="font-medium uppercase tracking-wider text-text-secondary">
                Reach (2-link, l₁ = {l1}, l₂ = {l2})
              </p>
              <p>
                Outer: <span className="font-mono text-text-secondary">r = {rMax.toFixed(2)}</span>{" "}
                <span className="text-text-muted">(max |x| = |y| = {maxAbs.toFixed(2)} on the circle)</span>
              </p>
              <p>
                Inner: <span className="font-mono text-text-secondary">r = {rMin.toFixed(2)}</span>{" "}
                <span className="text-text-muted">(elbow cannot fold tighter)</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </VizErrorBoundary>
  );
}

function drawGrid(ctx: CanvasRenderingContext2D) {
  const xExtent = 2.2;
  const yExtent = 2.3;
  ctx.strokeStyle = "rgba(30, 58, 42, 0.4)";
  ctx.lineWidth = 0.5;
  for (let i = -3; i <= 3; i++) {
    const [sx, sy] = toScreen(i, -yExtent);
    const [ex, ey] = toScreen(i, yExtent);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
  }
  for (let i = -2; i <= 2; i++) {
    const [sx, sy] = toScreen(-xExtent, i);
    const [ex, ey] = toScreen(xExtent, i);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(30, 58, 42, 0.85)";
  ctx.lineWidth = 1;
  const [ax0, ay0] = toScreen(-xExtent, 0);
  const [ax1, ay1] = toScreen(xExtent, 0);
  ctx.beginPath();
  ctx.moveTo(ax0, ay0);
  ctx.lineTo(ax1, ay1);
  ctx.stroke();
  const [bx0, by0] = toScreen(0, -yExtent);
  const [bx1, by1] = toScreen(0, yExtent);
  ctx.beginPath();
  ctx.moveTo(bx0, by0);
  ctx.lineTo(bx1, by1);
  ctx.stroke();

  ctx.fillStyle = "rgba(156, 163, 175, 0.35)";
  ctx.font = "9px monospace";
  ctx.textAlign = "center";
  for (let i = -2; i <= 2; i++) {
    if (i === 0) continue;
    const [lx, ly] = toScreen(i, 0);
    ctx.fillText(`${i}`, lx, ly + 12);
  }
  ctx.textAlign = "right";
  for (let i = -2; i <= 2; i++) {
    if (i === 0) continue;
    const [lx, ly] = toScreen(0, i);
    ctx.fillText(`${i}`, lx - 4, ly + 3);
  }
  ctx.textAlign = "left";
  const [oix, oiy] = toScreen(0, 0);
  ctx.fillText("0", oix + 4, oiy + 4);
}

function drawWorkspaceRing(ctx: CanvasRenderingContext2D, rMin: number, rMax: number) {
  const cx = ORIGIN_X;
  const cy = ORIGIN_Y;
  ctx.beginPath();
  ctx.arc(cx, cy, rMax * SCALE, 0, Math.PI * 2);
  ctx.arc(cx, cy, rMin * SCALE, 0, Math.PI * 2, true);
  ctx.fillStyle = "rgba(34, 197, 94, 0.06)";
  ctx.fill("evenodd");
  ctx.beginPath();
  ctx.arc(cx, cy, rMax * SCALE, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(34, 197, 94, 0.32)";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, rMin * SCALE, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
  ctx.setLineDash([4, 3]);
  ctx.stroke();
  ctx.setLineDash([]);

  const [atMaxX, atMaxY] = toScreen(rMax, 0);
  const [inMinX, inMinY] = toScreen(0, rMin);
  ctx.fillStyle = "rgba(34, 197, 94, 0.75)";
  ctx.font = "9px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.fillText(`r=${rMax.toFixed(1)}`, atMaxX + 2, atMaxY - 2);
  ctx.fillStyle = "rgba(245, 158, 11, 0.9)";
  ctx.textAlign = "right";
  ctx.fillText(`r=${rMin.toFixed(1)}`, inMinX - 2, inMinY - 2);
}

function drawTarget(
  ctx: CanvasRenderingContext2D,
  tx: number,
  ty: number,
  reachable: boolean,
  active: boolean
) {
  const [px, py] = toScreen(tx, ty);
  ctx.beginPath();
  ctx.arc(px, py, 7, 0, Math.PI * 2);
  ctx.fillStyle = reachable
    ? active
      ? "rgba(239, 68, 68, 0.35)"
      : "rgba(239, 68, 68, 0.2)"
    : "rgba(107, 114, 128, 0.35)";
  ctx.fill();
  ctx.strokeStyle = reachable ? "#ef4444" : "#6b7280";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(px, py, 3, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
}

function drawArm(
  ctx: CanvasRenderingContext2D,
  theta1: number,
  theta2: number,
  l1: number,
  l2: number
) {
  const elbowX = l1 * Math.cos(theta1);
  const elbowY = l1 * Math.sin(theta1);
  const endX = elbowX + l2 * Math.cos(theta1 + theta2);
  const endY = elbowY + l2 * Math.sin(theta1 + theta2);

  const [ox, oy] = toScreen(0, 0);
  const [ex, ey] = toScreen(elbowX, elbowY);
  const [tx, ty] = toScreen(endX, endY);

  ctx.shadowColor = "rgba(34, 197, 94, 0.25)";
  ctx.shadowBlur = 6;

  ctx.strokeStyle = "#22c55e";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(ox, oy);
  ctx.lineTo(ex, ey);
  ctx.stroke();

  ctx.strokeStyle = "#10b981";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(tx, ty);
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#374151";
  ctx.strokeStyle = "#6b7280";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(ox, oy, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#f59e0b";
  ctx.beginPath();
  ctx.arc(ox, oy, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(ex, ey, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(tx, ty, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}
