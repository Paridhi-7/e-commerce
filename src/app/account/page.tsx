"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Heart,
  Package,
  Settings,
  ShoppingBag,
  Truck,
  User,
} from "lucide-react";
import { ordersStore, savedStore, userStore, wishlistStore, useStore } from "@/lib/shop";
import { money, longDate, productHref } from "@/lib/format";
import { getCatalogVendor as getVendor, productImage, useCatalog } from "@/lib/catalog";
import { SmartImage, Rating } from "@/components/ui";
import { LinkButton, Button, Badge } from "@/components/buttons";
import type { PlacedOrder, SafeUser, WishlistItem } from "@/lib/types";

const TABS = [
  { id: "orders", label: "Orders", icon: Package },
  { id: "saved", label: "Saved items", icon: Heart },
  { id: "profile", label: "Profile", icon: Settings },
] as const;

export default function AccountPage() {
  return (
    <Suspense
      fallback={<div className="py-28 text-center text-sm text-muted">Loading…</div>}
    >
      <AccountInner />
    </Suspense>
  );
}

function AccountInner() {
  const sp = useSearchParams();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>(
    sp.get("tab") === "saved" ? "saved" : "orders"
  );
  const orders = useStore(ordersStore);
  const wishlist = useStore(wishlistStore);
  const savedItems = useStore(savedStore);
  const user = useStore(userStore);
  useCatalog(); // so product images resolve from the MongoDB-backed catalog

  const saved = savedItems.slice(0, 6);

  const totalSpent = orders.reduce((n, o) => n + o.total, 0);
  const initials = (user?.name ?? "Guest")
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-xl font-extrabold text-accent">
            {initials || "G"}
          </span>
          <div>
            <h1 className="h2">{user?.name ?? "Guest shopper"}</h1>
            <p className="text-[13px] text-muted">
              {user ? `${user.role} · ${user.email}` : "Sign in to sync across devices"}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            [String(orders.length), "orders"],
            [money(totalSpent), "lifetime"],
            [String(wishlist.length), "saved"],
          ].map(([v, l]) => (
            <div key={l} className="rounded-2xl border border-line bg-surface px-5 py-3.5 text-center shadow-card">
              <p className="tabular text-lg font-extrabold">{v}</p>
              <p className="text-[11px] text-muted">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* tabs */}
      <div className="mt-8 flex gap-1 rounded-full border border-line bg-surface p-1 shadow-card sm:w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors sm:flex-none ${
              tab === t.id ? "text-white" : "text-muted hover:text-foreground"
            }`}
          >
            {tab === t.id && (
              <motion.span
                layoutId="account-tab"
                className="absolute inset-0 rounded-full bg-foreground"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <t.icon size={15} className="relative z-10" />
            <span className="relative z-10">{t.label}</span>
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
            {tab === "orders" && <OrdersPanel orders={orders} />}
            {tab === "saved" && (
              <SavedPanel items={saved} hasItems={wishlist.length > 0} />
            )}
            {tab === "profile" && <ProfilePanel user={user} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function OrdersPanel({ orders }: { orders: PlacedOrder[] }) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-line-strong py-20 text-center">
        <Truck size={28} className="text-subtle" />
        <p className="text-base font-bold">No orders yet</p>
        <p className="text-sm text-muted">Your order history will appear here after checkout.</p>
        <LinkButton href="/marketplace" size="sm" className="mt-2">
          Browse marketplace
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {orders.map((o) => (
        <article key={o.id} className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-muted/50 px-5 py-3.5 text-[13px]">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
              <span className="font-bold">{o.id}</span>
              <span className="text-muted">Placed {longDate(o.placedAt)}</span>
              <Badge tone="success">In transit</Badge>
            </div>
            <Link href={`/order/${o.id}`} className="font-semibold text-accent hover:underline">
              View details
            </Link>
          </header>
          <div className="flex gap-3 overflow-x-auto px-5 py-4 no-scrollbar">
            {o.lines.map((l) => (
              <Link
                key={l.slug}
                href={productHref(l.slug)}
                className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-line bg-surface-muted"
              >
                <SmartImage src={productImage(l.slug)} alt="" sizes="64px" />
              </Link>
            ))}
          </div>
          <footer className="flex items-center justify-between border-t border-line px-5 py-3.5 text-sm">
            <span className="text-muted">
              {o.lines.reduce((n, l) => n + l.qty, 0)} items · paid {o.payment}
            </span>
            <span className="tabular font-extrabold">{money(o.total)}</span>
          </footer>
        </article>
      ))}
    </div>
  );
}

function SavedPanel({
  items,
  hasItems,
}: {
  items: WishlistItem[];
  hasItems: boolean;
}) {
  if (!hasItems) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-line-strong py-20 text-center">
        <Heart size={28} className="text-subtle" />
        <p className="text-base font-bold">Nothing saved yet</p>
        <p className="text-sm text-muted">Tap the heart on any product to keep it here.</p>
        <LinkButton href="/marketplace" size="sm" className="mt-2">
          Discover products
        </LinkButton>
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ line, product }) => {
        const vendor = getVendor(product.vendorId);
        return (
          <Link
            key={line.slug}
            href={productHref(product.slug)}
            className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-muted">
              <SmartImage src={product.img} alt="" sizes="64px" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
                {vendor?.name ?? "Independent"}
              </p>
              <p className="truncate text-sm font-semibold">{product.name}</p>
              <div className="mt-1 flex items-center justify-between">
                <Rating value={product.rating} size={11} />
                <span className="tabular text-sm font-bold">{money(product.price)}</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function ProfilePanel({ user }: { user: SafeUser | null }) {
  const [form, setForm] = useState({
    name: user?.name ?? "Guest",
    email: user?.email ?? "Not signed in",
    city: "New York, NY",
    phone: "+1 (212) 555-0148",
  });
  const [saved, setSaved] = useState(false);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
        <h3 className="flex items-center gap-2 text-base font-bold">
          <User size={17} className="text-accent" /> Profile details
        </h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {(
            [
              ["Full name", "name"],
              ["Email", "email"],
              ["Location", "city"],
              ["Phone", "phone"],
            ] as const
          ).map(([label, key]) => (
            <label key={key} className="block">
              <span className="mb-1.5 block text-[13px] font-semibold">{label}</span>
              <input
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-sm outline-none focus:border-accent-border focus:ring-4 focus:ring-accent/10"
              />
            </label>
          ))}
        </div>
        <div className="mt-6 flex items-center gap-3">
          <Button
            onClick={() => {
              setSaved(true);
              setTimeout(() => setSaved(false), 1600);
            }}
          >
            {saved ? "Saved ✓" : "Save changes"}
          </Button>
          <span className="text-[12px] text-subtle">
            Profile is stored on your device; cart, saved items and orders live in MongoDB.
          </span>
        </div>
      </div>

      <aside className="rounded-2xl border border-line bg-surface p-6 shadow-card">
        <h3 className="text-sm font-bold">Quick links</h3>
        <div className="mt-4 space-y-2">
          <Link
            href="/vendor-dashboard"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
          >
            <ShoppingBag size={15} /> Vendor dashboard
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
          >
            <Settings size={15} /> Admin console
          </Link>
        </div>
        <div className="mt-6 rounded-xl bg-accent-soft p-4 text-[13px] leading-relaxed text-accent">
          Tip: your cart, saved items and orders are persisted in MongoDB and survive
          reloads and device switches once you sign in.
        </div>
      </aside>
    </div>
  );
}
