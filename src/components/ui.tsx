"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { Minus, Plus, Star, StarHalf } from "lucide-react";

/* ------------------------------------------------------------------ */
/* URL builder — joins params correctly (?...&w=) for any remote host  */
/* ------------------------------------------------------------------ */
export function buildSrc(src: string, width: number, quality: number) {
  if (!src) return src;
  if (src.startsWith("data:") || src.startsWith("blob:")) return src;
  try {
    const url = new URL(src, "https://invalid.invalid");
    if (url.hostname === "invalid.invalid") return src; // relative path, leave as-is
    if (src.includes("unsplash.com")) {
      const base = url.origin + url.pathname;
      const keep = new URLSearchParams();
      for (const [k, v] of url.searchParams) {
        if (["auto", "fit", "crop", "fm"].includes(k)) keep.set(k, v);
      }
      keep.set("w", String(width));
      if (!keep.has("q")) keep.set("q", String(quality));
      return `${base}?${keep.toString()}`;
    }
    if (!url.searchParams.has("w") && !url.searchParams.has("width")) {
      url.searchParams.set("w", String(width));
    }
    return url.toString();
  } catch {
    return src;
  }
}

/* ------------------------------------------------------------------ */
/* Deterministic picsum fallback (no repeats of the same seed)         */
/* ------------------------------------------------------------------ */
export function fallbackFor(src: string, w = 800, h = 800) {
  if (src.includes("picsum.photos")) return src;
  const seed = src.match(/photo-([\w-]{10,})/)?.[1] ?? "kartify";
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  buildSrc(src, width, quality ?? 75);

/* ------------------------------------------------------------------ */
/* SmartImage — shimmer skeleton, Unsplash→picsum fallback chain       */
/* ------------------------------------------------------------------ */
export function SmartImage({
  src,
  alt,
  className = "",
  sizes,
  fill = true,
  width,
  height,
  priority = false,
  round = false,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  round?: boolean;
}) {
  const [stage, setStage] = useState(0); // 0 primary → 1 picsum fallback → 2 icon
  const [loaded, setLoaded] = useState(false);

  const display = stage === 1 ? fallbackFor(src) : src;

  if (stage === 2 || !display) {
    return (
      <div
        className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-surface-muted text-subtle ${round ? "rounded-full" : ""} ${className}`}
        aria-label={alt}
      >
        <div className="absolute inset-0 shimmer" aria-hidden />
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
        <span className="sr-only">{alt}</span>
      </div>
    );
  }

  return (
    <>
      {!loaded && <div className="absolute inset-0 shimmer" aria-hidden />}
      <Image
        key={display}
        src={display}
        alt={alt}
        {...(fill
          ? { fill: true, sizes: sizes ?? "(max-width: 768px) 100vw, 33vw" }
          : { width: width ?? 400, height: height ?? 400 })}
        loader={imageLoader}
        className={className}
        priority={priority}
        onError={() => setStage((s) => s + 1)}
        onLoad={() => setLoaded(true)}
        unoptimized
        style={{ objectFit: "cover" }}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Rating                                                              */
/* ------------------------------------------------------------------ */
export function Rating({
  value,
  size = 14,
  className = "",
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  const full = Math.floor(value);
  const half = value - full >= 0.4;
  return (
    <span className={`inline-flex items-center gap-[1px] ${className}`} aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < full)
          return <Star key={i} size={size} className="fill-amber-400 text-amber-400" />;
        if (i === full && half)
          return (
            <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
              <Star size={size} className="absolute inset-0 text-amber-400/40" />
              <StarHalf size={size} className="absolute inset-0 fill-amber-400 text-amber-400" />
            </span>
          );
        return <Star key={i} size={size} className="text-zinc-300" />;
      })}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Reveal on scroll                                                    */
/* ------------------------------------------------------------------ */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className = "",
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.6, 0.35, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Quantity stepper                                                    */
/* ------------------------------------------------------------------ */
export function QtyStepper({
  value,
  onChange,
  max = 99,
  small = false,
}: {
  value: number;
  onChange: (v: number) => void;
  max?: number;
  small?: boolean;
}) {
  const btn = `flex items-center justify-center text-muted hover:text-foreground transition-colors ${small ? "h-7 w-7" : "h-9 w-9"}`;
  return (
    <div
      className={`inline-flex items-center rounded-full border border-line bg-surface ${small ? "h-7" : "h-9"}`}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        className={`${btn} rounded-l-full`}
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
      >
        <Minus size={small ? 12 : 14} />
      </button>
      <span className={`tabular min-w-6 text-center font-medium ${small ? "text-xs" : "text-sm"}`}>
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        className={`${btn} rounded-r-full`}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        <Plus size={small ? 12 : 14} />
      </button>
    </div>
  );
}
