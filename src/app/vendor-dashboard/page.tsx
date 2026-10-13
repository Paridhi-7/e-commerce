"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  Package,
  Pencil,
  Plus,
  ShoppingBag,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { money, productHref } from "@/lib/format";
import { SmartImage } from "@/components/ui";
import { Button, Badge, LinkButton } from "@/components/buttons";
import { BarChart } from "@/components/chart";
import { toast, useStore, userStore } from "@/lib/shop";
import type { Product, Vendor } from "@/lib/types";

type VendorOrder = {
  id: string;
  vendorId: string;
  customer: string;
  date: string;
  items: { slug: string; qty: number; name?: string; price?: number }[];
  total: number;
  status: "new" | "packing" | "shipped" | "delivered";
};

interface DashboardData {
  vendor: Vendor | null;
  products: Product[];
  orders: VendorOrder[];
  stats: { sales12m: { label: string; value: number }[]; channelSplit: { label: string; pct: number }[] };
  lowStock: { slug: string; name: string; stock: number; price: number }[];
  revenueMonth: number;
}

const STATUS_TONE: Record<string, "accent" | "warning" | "success" | "neutral"> = {
  new: "accent",
  packing: "warning",
  shipped: "accent",
  delivered: "success",
};

type TabId = "overview" | "products" | "orders";

export default function VendorDashboardPage() {
  const user = useStore(userStore);
  const [tab, setTab] = useState<TabId>("overview");
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = () =>
    fetch("/api/vendor/dashboard", { cache: "no-store" })
      .then(async (r) => {
        if (r.ok) return r.json();
        const body = await r.json().catch(() => null);
        throw new Error(body?.error ?? r.status === 401 ? "Please sign in as a vendor." : "Failed to load dashboard");
      })
      .then((d: DashboardData) => setData(d))
      .catch((err) => setError(String(err.message)));

  useEffect(() => {
    if (user?.role !== "vendor") return;
    loadDashboard();
  }, [user]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="relative h-14 w-14 overflow-hidden rounded-2xl border border-line shadow-sm bg-surface-muted">
            <SmartImage src={data?.vendor?.logo ?? ""} alt={data?.vendor?.name ?? ""} sizes="56px" />
          </span>
          <div>
            <p className="eyebrow text-accent">Vendor dashboard</p>
            <h1 className="h2 mt-1">{data?.vendor?.name ?? "Vendor dashboard"}</h1>
          </div>
        </div>
        {data?.vendor && (
          <Link
            href={`/vendor/${data.vendor.slug}`}
            className="text-sm font-semibold text-accent hover:underline"
          >
            View public storefront →
          </Link>
        )}
      </div>

      {user?.role !== "vendor" ? (
        <div className="mt-10 flex flex-col items-center gap-4 rounded-3xl border border-dashed border-line-strong py-20 text-center">
          <ShoppingBag size={28} className="text-subtle" />
          <p className="text-base font-bold">Vendor access required</p>
          <p className="max-w-md text-sm text-muted">
            Sign in with a vendor account to manage your storefront, products and orders.
            Demo credentials: <b>vendor@kartify.shop</b> / <b>vendor123</b>
          </p>
          <LinkButton size="sm" href="/login">
            Sign in as vendor
          </LinkButton>
        </div>
      ) : error ? (
        <p className="py-24 text-center text-sm text-danger">{error}</p>
      ) : !data ? (
        <p className="py-24 text-center text-sm text-muted">Loading your storefront data…</p>
      ) : !data.vendor ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-line-strong py-20 text-center">
          <Package size={28} className="text-subtle" />
          <p className="text-base font-bold">Your storefront is being reviewed</p>
          <p className="text-sm text-muted">
            Your vendor profile is pending approval by the KARTIFY team.
          </p>
        </div>
      ) : (
        <>
          {/* tabs */}
          <div className="mt-8 flex gap-1 rounded-full border border-line bg-surface p-1 shadow-card sm:w-fit">
            {(
              [
                ["overview", "Overview"],
                ["products", "Products"],
                ["orders", "Orders"],
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
                    layoutId="vendor-dash-tab"
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
                {tab === "products" && <ProductsPanel data={data} onRefresh={loadDashboard} />}
                {tab === "orders" && <OrdersPanel data={data} onRefresh={loadDashboard} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------- overview ---------------- */
function Overview({ data }: { data: DashboardData }) {
  const revenue = data.revenueMonth || data.stats.sales12m.at(-1)?.value || 0;
  const orders = data.orders.length;
  const aov = orders > 0 ? Math.round(data.orders.reduce((n, o) => n + o.total, 0) / orders) : 0;
  const sales12m = data.stats.sales12m.length
    ? data.stats.sales12m
    : Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1}`, value: 0 }));

  const stats = [
    { label: "Revenue (last month)", value: money(revenue), delta: "from MongoDB", up: true, icon: DollarSign, spark: sales12m.slice(-6).map((d) => d.value) },
    { label: "Orders", value: String(orders), delta: "total", up: true, icon: ShoppingBag, spark: [3, 5, 4, 6, 8, 7, 8] },
    { label: "Avg. order", value: money(aov), delta: "recent", up: true, icon: Star, spark: [180, 210, 195, 230, 220, 240] },
    { label: "Products", value: String(data.products.length), delta: "in catalog", up: true, icon: Package, spark: [4, 3.8, 3.9, 3.5, 3.6, 3.4] },
  ];

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
              <span
                className={`flex items-center gap-0.5 text-[12px] font-bold ${s.up ? "text-success" : "text-danger"}`}
              >
                {s.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
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
              <h3 className="h3">Sales, last 12 months</h3>
              <p className="text-[13px] text-muted">Gross revenue across all products</p>
            </div>
            <Badge tone="success">live data</Badge>
          </div>
          <div className="mt-6">
            <BarChart data={sales12m} height={200} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
            <h3 className="h3">Low stock</h3>
            <div className="mt-4 space-y-3">
              {data.lowStock.length === 0 && (
                <p className="text-sm text-muted">All products are well stocked.</p>
              )}
              {data.lowStock.map((p) => (
                <Link
                  key={p.slug}
                  href={productHref(p.slug)}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="truncate">{p.name}</span>
                  <Badge tone={p.stock <= 8 ? "danger" : "warning"}>{p.stock} left</Badge>
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
            <h3 className="h3">Recent orders</h3>
            <div className="mt-4 space-y-3">
              {data.orders.slice(0, 4).map((o) => (
                <div key={o.id} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{o.customer}</p>
                    <p className="text-[12px] text-muted">{o.id}</p>
                  </div>
                  <span className="tabular shrink-0 font-bold">{money(o.total)}</span>
                </div>
              ))}
              {data.orders.length === 0 && (
                <p className="text-sm text-muted">No orders yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- products CRUD ---------------- */
interface Draft {
  slug?: string;
  name: string;
  category: string;
  price: string;
  stock: string;
  badge?: Product["badge"];
  description: string;
}

const EMPTY_DRAFT: Draft = {
  name: "",
  category: "Bags",
  price: "",
  stock: "20",
  badge: undefined,
  description: "",
};

function ProductsPanel({
  data,
  onRefresh,
}: {
  data: DashboardData;
  onRefresh: () => Promise<void>;
}) {
  const [editing, setEditing] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const all = data.products;

  const save = async () => {
    if (!editing) return;
    if (!editing.name.trim() || !editing.price.trim()) {
      toast("Missing fields", "Name and price are required");
      return;
    }
    const priceNum = Number(editing.price);
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      toast("Invalid price", "Enter a positive number");
      return;
    }
    setBusy(true);
    const payload = {
      name: editing.name,
      category: editing.category,
      price: priceNum,
      stock: Number(editing.stock) || 0,
      badge: editing.badge,
      description: editing.description,
    };
    const method = editing.slug ? "PATCH" : "PUT";
    const body = editing.slug ? { slug: editing.slug, ...payload } : payload;
    try {
      const res = await fetch("/api/vendor/products", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "Save failed" }));
        toast("Save failed", error);
      } else {
        toast(editing.slug ? "Product updated" : "Product created", editing.name);
        setEditing(null);
        await onRefresh();
      }
    } finally {
      setBusy(false);
    }
  };

  const remove = async (slug: string) => {
    try {
      const res = await fetch("/api/vendor/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (res.ok) {
        toast("Product deleted");
        await onRefresh();
      } else {
        toast("Delete failed", res.status === 404 ? "Already removed" : undefined);
      }
    } catch {
      toast("Delete failed", "Network error");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="h3">Your products ({all.length})</h3>
          <p className="text-[13px] text-muted">
            Changes are persisted in MongoDB immediately.
          </p>
        </div>
        <Button onClick={() => setEditing({ ...EMPTY_DRAFT })}>
          <Plus size={16} /> Add product
        </Button>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-muted/50 text-[12px] uppercase tracking-wide text-muted">
                <th className="px-5 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {all.map((p) => (
                <tr key={p.slug} className="transition-colors hover:bg-surface-muted/40">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                        <SmartImage src={p.img} alt="" sizes="44px" />
                      </div>
                      <span className="line-clamp-1 font-semibold">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-muted">{p.category}</td>
                  <td className="tabular px-4 py-3.5 font-semibold">{money(p.price)}</td>
                  <td className="tabular px-4 py-3.5">
                    <span className={p.stock <= 8 ? "font-bold text-danger" : ""}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge tone={p.stock === 0 ? "danger" : p.stock <= 8 ? "warning" : "success"}>
                      {p.stock === 0 ? "Out" : p.stock <= 8 ? "Low" : "Active"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex justify-end gap-1.5">
                      <button
                        aria-label="Edit"
                        onClick={() =>
                          setEditing({
                            slug: p.slug,
                            name: p.name,
                            category: p.category,
                            price: String(p.price),
                            stock: String(p.stock),
                            badge: p.badge,
                            description: p.description,
                          })
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        aria-label="Delete"
                        onClick={() => remove(p.slug)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger-soft hover:text-danger"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {all.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-muted">
                    No products yet — add your first one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* modal */}
      <AnimatePresence>
        {editing && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-foreground/40 backdrop-blur-sm"
              onClick={() => setEditing(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
              className="fixed left-1/2 top-1/2 z-[61] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-line bg-surface p-6 shadow-pop"
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-center justify-between">
                <h3 className="h3">{editing.slug ? "Edit product" : "Add product"}</h3>
                <button onClick={() => setEditing(null)} aria-label="Close" className="text-muted hover:text-foreground">
                  <X size={18} />
                </button>
              </div>
              <div className="mt-5 space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-semibold">Name</span>
                  <input
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    className="h-11 w-full rounded-xl border border-line px-3.5 text-sm outline-none focus:border-accent-border focus:ring-4 focus:ring-accent/10"
                    placeholder="e.g. City Tote 14&quot;"
                  />
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="mb-1.5 block text-[13px] font-semibold">Category</span>
                    <select
                      value={editing.category}
                      onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                      className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm outline-none focus:border-accent-border"
                    >
                      {["Bags", "Home & Living", "Audio", "Stationery", "Desk", "Beauty"].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[13px] font-semibold">Badge</span>
                    <select
                      value={editing.badge ?? ""}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          badge: (e.target.value || undefined) as Product["badge"],
                        })
                      }
                      className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm outline-none focus:border-accent-border"
                    >
                      <option value="">None</option>
                      {["Bestseller", "New", "Limited", "Sale"].map((b) => (
                        <option key={b}>{b}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[13px] font-semibold">Price ($)</span>
                    <input
                      type="number"
                      min="1"
                      value={editing.price}
                      onChange={(e) => setEditing({ ...editing, price: e.target.value })}
                      className="h-11 w-full rounded-xl border border-line px-3.5 text-sm outline-none focus:border-accent-border focus:ring-4 focus:ring-accent/10"
                      placeholder="128"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[13px] font-semibold">Stock</span>
                    <input
                      type="number"
                      min="0"
                      value={editing.stock}
                      onChange={(e) => setEditing({ ...editing, stock: e.target.value })}
                      className="h-11 w-full rounded-xl border border-line px-3.5 text-sm outline-none focus:border-accent-border focus:ring-4 focus:ring-accent/10"
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-semibold">Description</span>
                  <textarea
                    value={editing.description}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm outline-none focus:border-accent-border focus:ring-4 focus:ring-accent/10"
                    placeholder="What makes this piece special?"
                  />
                </label>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button onClick={save} disabled={busy}>
                  {busy ? "Saving…" : editing.slug ? "Save changes" : "Create product"}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- orders ---------------- */
function OrdersPanel({
  data,
  onRefresh,
}: {
  data: DashboardData;
  onRefresh: () => Promise<void>;
}) {
  const [filter, setFilter] = useState<"all" | "new" | "packing" | "shipped" | "delivered">("all");
  const list = filter === "all" ? data.orders : data.orders.filter((o) => o.status === filter);

  const advance = async (id: string, status: VendorOrder["status"]) => {
    const res = await fetch("/api/vendor/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      toast("Order updated", status);
      await onRefresh();
    } else {
      toast("Update failed");
    }
  };

  const nextStatus: Record<VendorOrder["status"], VendorOrder["status"] | null> = {
    new: "packing",
    packing: "shipped",
    shipped: "delivered",
    delivered: null,
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(["all", "new", "packing", "shipped", "delivered"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-[13px] font-semibold capitalize transition-colors ${
              filter === f
                ? "bg-foreground text-white"
                : "border border-line bg-surface text-muted hover:text-foreground"
            }`}
          >
            {f} ({f === "all" ? data.orders.length : data.orders.filter((o) => o.status === f).length})
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {list.map((o) => (
          <motion.article
            key={o.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card"
          >
            <div className="min-w-[140px] flex-1">
              <p className="text-sm font-bold">{o.customer}</p>
              <p className="text-[12px] text-muted">
                {o.id} · {o.date}
              </p>
            </div>
            <div className="flex flex-1 flex-wrap gap-2">
              {o.items.map((i) => (
                <span key={i.slug} className="rounded-full bg-surface-muted px-3 py-1 text-[12px] font-medium text-muted">
                  {i.name ?? i.slug} × {i.qty}
                </span>
              ))}
            </div>
            <Badge tone={STATUS_TONE[o.status]}>{o.status}</Badge>
            <span className="tabular w-20 text-right text-sm font-extrabold">{money(o.total)}</span>
            {nextStatus[o.status] && (
              <Button size="sm" variant="outline" onClick={() => advance(o.id, nextStatus[o.status]!)}>
                Mark {nextStatus[o.status]}
              </Button>
            )}
          </motion.article>
        ))}
        {list.length === 0 && (
          <p className="rounded-3xl border border-dashed border-line-strong py-16 text-center text-sm text-muted">
            No orders in this stage.
          </p>
        )}
      </div>
    </div>
  );
}
