"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

const variants = {
  primary:
    "bg-accent text-white hover:bg-accent-hover active:bg-accent-active shadow-sm hover:shadow-md hover:-translate-y-px active:translate-y-0",
  dark: "bg-foreground text-white hover:bg-zinc-700 active:bg-zinc-800 shadow-sm hover:-translate-y-px active:translate-y-0",
  outline:
    "border border-line-strong bg-surface text-foreground hover:border-foreground/40 hover:bg-surface-muted active:bg-surface",
  ghost: "text-foreground hover:bg-surface-muted",
  soft: "bg-accent-soft text-accent hover:bg-accent-border/60 active:bg-accent-border",
  danger: "bg-danger-soft text-danger hover:bg-red-100",
};

const sizes = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-6 text-sm",
  lg: "h-[52px] px-8 text-[15px]",
};

type Common = {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: Common & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: Common & { href: string } & Omit<React.ComponentProps<typeof Link>, "href" | "className" | "children">) {
  return (
    <Link
      href={href}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </Link>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "success" | "warning" | "danger" | "dark";
  className?: string;
}) {
  const tones = {
    neutral: "bg-surface-muted text-muted",
    accent: "bg-accent-soft text-accent",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    danger: "bg-danger-soft text-danger",
    dark: "bg-foreground text-white",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function CartBounce({ children }: { children: ReactNode }) {
  return (
    <motion.div
      key="cart-bounce"
      animate={{ scale: [1, 1.18, 1] }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="inline-flex"
    >
      {children}
    </motion.div>
  );
}
