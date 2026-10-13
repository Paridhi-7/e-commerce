"use client";

import { motion } from "framer-motion";
import { useId } from "react";

export function BarChart({
  data,
  height = 180,
  color = "var(--accent)",
}: {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div>
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((d, i) => (
          <div key={d.label} className="group relative flex h-full flex-1 flex-col justify-end">
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: `${(d.value / max) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.05, ease: [0.21, 0.6, 0.35, 1] }}
              className="w-full rounded-t-lg"
              style={{ background: color, minHeight: 4 }}
            />
            <span className="pointer-events-none absolute -top-7 left-1/2 z-10 -translate-x-1/2 rounded-md bg-foreground px-2 py-0.5 text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
              ${d.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        {data.map((d) => (
          <span key={d.label} className="flex-1 text-center text-[10px] font-medium text-subtle">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Sparkline({
  data,
  width = 120,
  height = 36,
  color = "var(--accent)",
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  const id = useId();
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (width - 4) + 2;
    const y = height - 3 - ((v - min) / range) * (height - 8);
    return `${x},${y}`;
  });
  const path = `M ${pts.join(" L ")}`;
  const area = `${path} L ${width - 2},${height} L 2,${height} Z`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#grad-${id})`} />
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    </svg>
  );
}
