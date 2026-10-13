"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { Button } from "@/components/buttons";
import { toast, userStore } from "@/lib/shop";
import type { SafeUser } from "@/lib/types";

const DEMO_ACCOUNTS = [
  { label: "Customer", email: "demo@kartify.shop", password: "demo123" },
  { label: "Vendor", email: "vendor@kartify.shop", password: "vendor123" },
  { label: "Admin", email: "admin@kartify.shop", password: "admin123" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const { user, error: authError } = (await res.json()) as {
        user?: SafeUser;
        error?: string;
      };
      if (!res.ok || !user) {
        setError(authError ?? "Could not sign in");
        return;
      }
      userStore.set(user);
      toast("Welcome back", `Signed in as ${user.name}`);
      router.push(
        user.role === "vendor" ? "/vendor-dashboard" : user.role === "admin" ? "/admin" : "/account"
      );
    } catch {
      setError("Network error, please try again");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl border border-line bg-surface p-8 shadow-panel"
      >
        <h1 className="h2">Welcome back</h1>
        <p className="mt-2 text-sm text-muted">
          Sign in to your KARTIFY account — credentials live in MongoDB.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold">Email</span>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 w-full rounded-xl border border-line bg-surface pl-10 pr-3.5 text-sm outline-none focus:border-accent-border focus:ring-4 focus:ring-accent/10"
              />
            </div>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold">Password</span>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 w-full rounded-xl border border-line bg-surface pl-10 pr-3.5 text-sm outline-none focus:border-accent-border focus:ring-4 focus:ring-accent/10"
              />
            </div>
          </label>

          {error && <p className="text-[13px] font-medium text-danger">{error}</p>}

          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy ? "Signing in…" : <>Sign in <ArrowRight size={16} /></>}
          </Button>
        </form>

        {/* demo accounts */}
        <div className="mt-6 rounded-2xl bg-surface-muted/60 p-4">
          <p className="text-[12px] font-bold uppercase tracking-wide text-subtle">
            Demo accounts — click to fill
          </p>
          <div className="mt-3 space-y-2">
            {DEMO_ACCOUNTS.map((d) => (
              <button
                key={d.email}
                type="button"
                onClick={() => {
                  setEmail(d.email);
                  setPassword(d.password);
                }}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3 py-2 text-left text-[13px] transition-colors hover:border-accent-border"
              >
                <span className="font-semibold">{d.label}</span>
                <span className="text-muted">{d.email}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-[13px] text-muted">
          New to KARTIFY?{" "}
          <Link href="/signup" className="font-semibold text-accent hover:underline">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
