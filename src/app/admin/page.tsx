"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  Check,
  DollarSign,
  Lock,
  Package,
  Plus,
  ShieldCheck,
  Star,
  ShoppingBag,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { CATEGORIES } from "@/lib/products";
import { money } from "@/lib/format";
import { SALES_12M } from "@/lib/vendor-orders";
import { SmartImage, Rating } from "@/components/ui";
import { Button, Badge, LinkButton } from "@/components/buttons";
import { BarChart, Sparkline } from "@/components/chart";
import { toast, useStore, userStore } from "@/lib/shop";
import type { Product, Vendor } from "@/lib/types";

interface AdminOverview {
  vendors: Vendor[];
  products: Product[];
  productCount: number;
  orderCount: number;
  usersCount: number;
  revenue: number;
}

export default function AdminPage() {
  const user = useStore(userStore);
  const [data, setData] = useState<AdminOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== "admin") return;
    fetch("/api/admin/overview", { cache: "no-store" })
      .then(async (r) => {
        if (r.ok) return r.json();
        const body = await r.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to load admin overview");
      })
      .then((d: AdminOverview) => setData(d))
      .catch((err) => setError(err.message));
  }, [user]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground text-white">
          <ShieldCheck size={24} />
        </span>
        <div>
          <p className="eyebrow text-accent">Admin console</p>
          <h1 className="h2 mt-1">Platform overview</h1>
        </div>
        <Badge tone="accent" className="ml-auto hidden sm:inline-flex">
          <ShieldCheck size={12} /> Full access
        </Badge>
      </div>

      {user?.role !== "admin" ? (
        <div className="mt-10 flex flex-col items-center gap-4 rounded-3xl border border-dashed border-line-strong py-20 text-center">
          <Lock size={28} className="text-subtle" />
          <p className="text-base font-bold">Admin access required</p>
          <p className="max-w-md text-sm text-muted">
            Sign in with an admin account to manage vendors and view platform stats.
            Demo credentials: <b>admin@kartify.shop</b> / <b>admin123</b>
          </p>
          <LinkButton size="sm" href="/login">
            <ShoppingBag size={14} /> Sign in as admin
          </LinkButton>
        </div>
      ) : error ? (
        <p className="mt-10 text-center text-sm text-danger">{error}</p>
      ) : !data ? (
        <p className="py-24 text-center text-sm text-muted">Loading platform data…</p>
      ) : (
        <AdminTabs data={data} />
      )}
    </div>
  );
}

function AdminTabs({ data }: { data: AdminOverview }) {
  const [tab, setTab] = useState<"overview" | "vendors" | "categories">("overview");
  return (
    <>
      <div className="mt-8 flex gap-1 rounded-full border border-line bg-surface p-1 shadow-card sm:w-fit">
        {(
          [
            ["overview", "Overview"],
            ["vendors", "Vendors"],
            ["categories", "Categories"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`relative flex-1 rounded-full px-6 py-2.5 text-sm font-semibold transition-colors sm:flex-none ${
              tab === id ? "text-white" : "text-muted hover:text-foreground"
            }`}
          >
            {tab === id && (
              <motion.span
                layoutId="admin-tab"
                className="absolute inset-0 rounded-full bg-foreground"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10">{label}</span>
          </button>
        ))}
      </div>

      <div className="mt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {tab === "overview" && <Overview data={data} />}
            {tab === "vendors" && <VendorsPanel data={data} />}
            {tab === "categories" && <CategoriesPanel data={data} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}

function Overview({ data }: { data: AdminOverview }) {
  const { vendors, products } = data;
  const gmv = data.revenue || vendors.reduce((n, v) => n + v.revenue, 0);
  const stats = [
    { label: "GMV (all time)", value: money(gmv), delta: `${data.orderCount} orders`, up: true, icon: DollarSign },
    { label: "Active vendors", value: String(vendors.filter((v) => v.status === "approved").length), delta: `${vendors.filter(v => v.status === "pending").length} pending`, up: true, icon: Building2 },
    { label: "Products listed", value: String(data.productCount), delta: "live in MongoDB", up: true, icon: Package },
    { label: "Registered users", value: String(data.usersCount), delta: "accounts", up: true, icon: Users },
  ];

  const catTotals = CATEGORIES.map((c) => ({
    label: c.name.split(" ")[0],
    value: products.filter((p) => p.category === c.name).length,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl border border-line bg-surface p-5 shadow-card"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <s.icon size={16} />
              </span>
              <span className={`text-[12px] font-bold ${s.up ? "text-success" : "text-warning"}`}>
                {s.delta}
              </span>
            </div>
            <p className="tabular mt-4 text-2xl font-extrabold tracking-tight">{s.value}</p>
            <p className="text-[12px] text-muted">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="h3">Platform GMV</h3>
              <p className="text-[13px] text-muted">Gross merchandise value, trailing 12 months</p>
            </div>
            <Sparkline data={SALES_12M.map((d) => d.value)} width={140} height={40} />
          </div>
          <div className="mt-6">
            <BarChart data={SALES_12M} height={200} color="var(--foreground)" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
            <h3 className="h3">Products per category</h3>
            <div className="mt-5 space-y-3">
              {catTotals.map((c) => {
                const max = Math.max(...catTotals.map((x) => x.value), 1);
                return (
                  <div key={c.label}>
                    <div className="flex justify-between text-[13px]">
                      <span className="font-medium">{c.label}</span>
                      <span className="tabular text-muted">{c.value}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(c.value / max) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="h-full rounded-full bg-accent"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
            <h3 className="h3">Top vendors</h3>
            <div className="mt-4 space-y-3">
              {[...vendors]
                .filter((v) => v.status === "approved")
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 4)
                .map((v, i) => (
                  <div key={v.id} className="flex items-center gap-3">
                    <span className="tabular w-4 text-[13px] font-bold text-subtle">{i + 1}</span>
                    <div className="relative h-9 w-9 overflow-hidden rounded-lg">
                      <SmartImage src={v.logo} alt="" sizes="36px" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold">{v.name}</p>
                      <p className="text-[11px] text-muted">{money(v.revenue)} · {v.products} products</p>
                    </div>
                    <Rating value={v.rating} size={11} />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VendorsPanel({ data }: { data: AdminOverview }) {
  const [vendors, setVendors] = useState(data.vendors);

  const decide = async (id: string, status: "approved" | "suspended" | "pending") => {
    const vendor = vendors.find((v) => v.id === id);
    setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)));
    toast(
      status === "approved" ? "Vendor approved" : status === "suspended" ? "Vendor suspended" : "Vendor rejected",
      vendor?.name
    );
    await fetch("/api/admin/overview", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  };

  return (
    <div>
      <h3 className="h3">Vendor applications & management</h3>
      <p className="text-[13px] text-muted">
        Approve new storefronts, suspend violators. Changes persist in MongoDB.
      </p>

      <div className="mt-6 space-y-4">
        {vendors.map((v) => (
          <motion.article
            key={v.id}
            layout
            className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card"
          >
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
              <SmartImage src={v.logo} alt="" sizes="48px" />
            </div>
            <div className="min-w-[180px] flex-1">
              <p className="text-sm font-bold">{v.name}</p>
              <p className="text-[12px] text-muted">
                {v.location || "Location pending"} · joined {v.joined} · {v.products} products
              </p>
            </div>
            <div className="hidden items-center gap-1.5 text-sm sm:flex">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              <span className="font-semibold">{v.rating.toFixed(1)}</span>
            </div>
            <div className="hidden text-right sm:block">
              <p className="tabular text-sm font-bold">{money(v.revenue)}</p>
              <p className="text-[11px] text-muted">lifetime sales</p>
            </div>
            {v.status === "pending" ? (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => decide(v.id, "approved")}>
                  <Check size={14} /> Approve
                </Button>
                <Button size="sm" variant="danger" onClick={() => decide(v.id, "suspended")}>
                  <X size={14} /> Reject
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Badge tone={v.status === "approved" ? "success" : "danger"}>{v.status}</Badge>
                {v.status === "approved" && (
                  <Button size="sm" variant="outline" onClick={() => decide(v.id, "suspended")}>
                    Suspend
                  </Button>
                )}
                {v.status === "suspended" && (
                  <Button size="sm" variant="soft" onClick={() => decide(v.id, "approved")}>
                    Reinstate
                  </Button>
                )}
              </div>
            )}
          </motion.article>
        ))}
      </div>
    </div>
  );
}

function CategoriesPanel({ data }: { data: AdminOverview }) {
  const [cats, setCats] = useState(
    CATEGORIES.map((c) => ({ name: c.name, blurb: c.blurb }))
  );
  const [name, setName] = useState("");
  const [blurb, setBlurb] = useState("");

  const add = () => {
    if (!name.trim()) return;
    if (cats.some((c) => c.name.toLowerCase() === name.trim().toLowerCase())) {
      toast("Duplicate category", "That name already exists");
      return;
    }
    setCats((prev) => [...prev, { name: name.trim(), blurb: blurb.trim() || "New department" }]);
    toast("Category added", name.trim());
    setName("");
    setBlurb("");
  };

  const remove = (n: string) => {
    setCats((prev) => prev.filter((c) => c.name !== n));
    toast("Category removed", n);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div>
        <h3 className="h3">Marketplace categories</h3>
        <p className="text-[13px] text-muted">
          Categories power the storefront navigation and filters.
        </p>
        <div className="mt-6 space-y-3">
          <AnimatePresence initial={false}>
            {cats.map((c) => (
              <motion.div
                key={c.name}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface px-5 py-4 shadow-card"
              >
                <div>
                  <p className="text-sm font-bold">{c.name}</p>
                  <p className="text-[12px] text-muted">{c.blurb}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[12px] text-subtle">
                    {data.products.filter((p) => p.category === c.name).length} products
                  </span>
                  <button
                    onClick={() => remove(c.name)}
                    aria-label={`Remove ${c.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger-soft hover:text-danger"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <aside className="h-fit rounded-2xl border border-line bg-surface p-6 shadow-card">
        <h3 className="flex items-center gap-2 text-sm font-bold">
          <Plus size={15} className="text-accent" /> Add category
        </h3>
        <div className="mt-4 space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            className="h-11 w-full rounded-xl border border-line px-3.5 text-sm outline-none focus:border-accent-border focus:ring-4 focus:ring-accent/10"
          />
          <input
            value={blurb}
            onChange={(e) => setBlurb(e.target.value)}
            placeholder="Short tagline (optional)"
            className="h-11 w-full rounded-xl border border-line px-3.5 text-sm outline-none focus:border-accent-border focus:ring-4 focus:ring-accent/10"
          />
          <Button onClick={add} className="w-full" disabled={!name.trim()}>
            Create category
          </Button>
        </div>
      </aside>
    </div>
  );
}
