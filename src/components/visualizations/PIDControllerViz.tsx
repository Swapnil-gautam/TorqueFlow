"use client";

import {
  useState,
  useMemo,
  useRef,
  useLayoutEffect,
  useDeferredValue,
} from "react";
import { VizErrorBoundary } from "./VizErrorBoundary";

function simulatePID(
  kp: number,
  ki: number,
  kd: number,
  setpoint: number,
  dt: number,
  steps: number
) {
  const times: number[] = [];
  const values: number[] = [];
  let current = 0;
  let integral = 0;
  let prevError = 0;

  for (let i = 0; i <= steps; i++) {
    times.push(i * dt);
    values.push(current);
    const error = setpoint - current;
    integral += error * dt;
    const derivative = (error - prevError) / dt;
    const control = kp * error + ki * integral + kd * derivative;
    prevError = error;
    current += control * dt * 0.5;
  }

  return { times, values };
}

function PIDChart({
  kp,
  ki,
  kd,
  setpoint,
}: {
  kp: number;
  ki: number;
  kd: number;
  setpoint: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastSizeRef = useRef({ cssW: 0, cssH: 0 });

  const { times, values } = useMemo(
    () => simulatePID(kp, ki, kd, setpoint, 0.05, 200),
    [kp, ki, kd, setpoint]
  );

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const paint = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      const dpr = window.devicePixelRatio || 1;
      const bw = w * dpr;
      const bh = h * dpr;

      if (
        lastSizeRef.current.cssW !== w ||
        lastSizeRef.current.cssH !== h ||
        canvas.width !== bw ||
        canvas.height !== bh
      ) {
        lastSizeRef.current = { cssW: w, cssH: h };
        canvas.width = bw;
        canvas.height = bh;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const pad = { top: 20, right: 20, bottom: 30, left: 45 };
      const pw = w - pad.left - pad.right;
      const ph = h - pad.top - pad.bottom;

      ctx.fillStyle = "#0a0f0d";
      ctx.fillRect(0, 0, w, h);

      const tMax = times[times.length - 1] || 1;
      const yMax = Math.max(setpoint * 1.6, Math.max(...values) * 1.1, 1.5);
      const yMin = Math.min(0, Math.min(...values) * 1.1);
      const yRange = Math.max(yMax - yMin, 1e-6);

      const toX = (t: number) => pad.left + (t / tMax) * pw;
      const toY = (v: number) => pad.top + ph - ((v - yMin) / yRange) * ph;

      ctx.strokeStyle = "#1e3a2a";
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= 5; i++) {
        const yVal = yMin + (yRange * i) / 5;
        const y = toY(yVal);
        ctx.beginPath();
        ctx.moveTo(pad.left, y);
        ctx.lineTo(w - pad.right, y);
        ctx.stroke();

        ctx.fillStyle = "#6b7280";
        ctx.font = "10px monospace";
        ctx.textAlign = "right";
        ctx.fillText(yVal.toFixed(1), pad.left - 6, y + 3);
      }

      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(pad.left, toY(setpoint));
      ctx.lineTo(w - pad.right, toY(setpoint));
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#f59e0b";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("setpoint", w - pad.right - 45, toY(setpoint) - 6);

      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < values.length; i++) {
        const x = toX(times[i]);
        const y = toY(values[i]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.fillStyle = "#6b7280";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Time (s)", w / 2, h - 4);
      ctx.save();
      ctx.translate(12, h / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("Value", 0, 0);
      ctx.restore();

      ctx.fillStyle = "#22c55e";
      ctx.fillRect(pad.left + 8, pad.top + 4, 12, 3);
      ctx.fillStyle = "#9ca3af";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Response", pad.left + 24, pad.top + 10);
    };

    paint();

    const ro = new ResizeObserver(() => {
      paint();
    });
    ro.observe(container);
    return () => {
      ro.disconnect();
    };
  }, [times, values, setpoint]);

  return (
    <div ref={containerRef} className="h-full min-h-0 w-full">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}

export default function PIDControllerViz() {
  const [kp, setKp] = useState(2.0);
  const [ki, setKi] = useState(0.5);
  const [kd, setKd] = useState(0.3);
  const setpoint = 1.0;

  const chartKp = useDeferredValue(kp);
  const chartKi = useDeferredValue(ki);
  const chartKd = useDeferredValue(kd);

  return (
    <VizErrorBoundary>
      <div>
        <div className="h-[240px] min-h-0 bg-bg-primary p-1">
          <PIDChart
            kp={chartKp}
            ki={chartKi}
            kd={chartKd}
            setpoint={setpoint}
          />
        </div>
        <div className="space-y-2 border-t border-border-default bg-bg-secondary p-4">
          {[
            { label: "Kp (Proportional)", value: kp, set: setKp, min: 0, max: 10 },
            { label: "Ki (Integral)", value: ki, set: setKi, min: 0, max: 5 },
            { label: "Kd (Derivative)", value: kd, set: setKd, min: 0, max: 5 },
          ].map(({ label, value, set, min, max }) => (
            <div key={label}>
              <label className="mb-0.5 flex items-center justify-between text-xs text-text-secondary">
                <span>{label}</span>
                <span className="font-mono text-accent-green">
                  {value.toFixed(2)}
                </span>
              </label>
              <input
                type="range"
                min={min}
                max={max}
                step={0.05}
                value={value}
                onChange={(e) => set(parseFloat(e.target.value))}
                className="w-full accent-accent-green"
              />
            </div>
          ))}
          <p className="text-[11px] text-text-muted">
            Adjust gains to see how the system response changes. Green = actual,
            Gold dashed = setpoint.
          </p>
        </div>
      </div>
    </VizErrorBoundary>
  );
}
