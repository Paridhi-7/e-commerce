"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, ShoppingBag, Store } from "lucide-react";
import { Button } from "@/components/buttons";
import { toast, userStore } from "@/lib/shop";
import type { SafeUser } from "@/lib/types";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="py-28 text-center text-sm text-muted">Loading…</div>}>
      <SignupInner />
    </Suspense>
  );
}

function SignupInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const [type, setType] = useState<"customer" | "vendor">(
    sp.get("type") === "vendor" ? "vendor" : "customer"
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    studio: "",
    name: "",
    email: "",
    password: "",
    craft: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: type,
          vendorName: form.studio || undefined,
        }),
      });
      const { user, error: authError } = (await res.json()) as {
        user?: SafeUser;
        error?: string;
      };
      if (!res.ok || !user) {
        setError(authError ?? "Could not create the account");
        return;
      }
      userStore.set(user);
      toast(
        type === "vendor" ? "Application received" : "Account created",
        type === "vendor" ? "We review new storefronts within 48 hours" : "Welcome to KARTIFY"
      );
      setDone(true);
      setTimeout(() => {
        router.push(type === "vendor" ? "/vendor-dashboard" : "/marketplace");
      }, 1400);
    } catch {
      setError("Network error, please try again");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-28 text-center">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-success-soft text-success"
        >
          <Check size={30} />
        </motion.span>
        <h1 className="h2 mt-6">
          {type === "vendor" ? "Application received" : "Welcome to KARTIFY"}
        </h1>
        <p className="mt-2 text-[15px] text-muted">
          {type === "vendor"
            ? "Your vendor profile is pending approval in the database — here's your dashboard in the meantime."
            : "Your account is saved. Happy browsing."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl border border-line bg-surface p-8 shadow-panel"
      >
        <h1 className="h2">Create your account</h1>
        <p className="mt-2 text-sm text-muted">
          Choose how you&apos;ll use the marketplace.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2">
          {(
            [
              { id: "customer", label: "I'm shopping", icon: ShoppingBag },
              { id: "vendor", label: "I'm selling", icon: Store },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setType(t.id)}
              className={`rounded-2xl border p-4 text-center transition-all ${
                type === t.id
                  ? "border-accent bg-accent-softer ring-1 ring-accent/30"
                  : "border-line hover:border-line-strong"
              }`}
            >
              <t.icon size={20} className={`mx-auto ${type === t.id ? "text-accent" : "text-muted"}`} />
              <p className="mt-2 text-[13px] font-bold">{t.label}</p>
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {type === "vendor" && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
              <Input
                label="Studio / brand name"
                value={form.studio}
                onChange={set("studio")}
                placeholder="e.g. Copperline Studio"
                required
              />
            </motion.div>
          )}
          <Input label="Full name" value={form.name} onChange={set("name")} placeholder="Alex Morgan" required />
          <Input label="Email" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" required />
          {type === "vendor" && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
              <Input
                label="What do you make?"
                value={form.craft}
                onChange={set("craft")}
                placeholder="Ceramics, leather goods, audio…"
              />
            </motion.div>
          )}
          <Input label="Password" type="password" value={form.password} onChange={set("password")} placeholder="6+ characters" required minLength={6} />

          {error && <p className="text-[13px] font-medium text-danger">{error}</p>}

          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy
              ? "Creating…"
              : `${type === "vendor" ? "Submit application" : "Create account"} — saved to MongoDB`}
            <ArrowRight size={16} />
          </Button>
        </form>

        {type === "vendor" && (
          <p className="mt-4 rounded-xl bg-accent-soft p-3.5 text-[12px] leading-relaxed text-accent">
            Vendor accounts go through a quick curation review — that&apos;s what keeps the
            marketplace worth browsing.
          </p>
        )}

        <p className="mt-6 text-center text-[13px] text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

function Input({
  label,
  ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold">{label}</span>
      <input
        {...rest}
        className="h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-sm outline-none transition-all placeholder:text-subtle focus:border-accent-border focus:ring-4 focus:ring-accent/10"
      />
    </label>
  );
}
