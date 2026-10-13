"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";
import {
  cartStore,
  detailedCart,
  removeFromCart,
  setCartQty,
  useStore,
  cartTotals,
} from "@/lib/shop";
import type { DetailedLine } from "@/lib/types";
import { money, productHref, vendorHref } from "@/lib/format";
import { SmartImage } from "@/components/ui";
import { LinkButton, Badge } from "@/components/buttons";

export default function CartPage() {
  const cart = useStore(cartStore);
  const items = useMemo(() => detailedCart(cart), [cart]);
  const { subtotal, shipping, total } = cartTotals(items);

  const groups: [string, DetailedLine[]][] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last[0] === item.product.vendorId) last[1].push(item);
    else groups.push([item.product.vendorId, [item]]);
  }

  const freeGap = Math.max(0, 150 - subtotal);
  const progress = Math.min(100, (subtotal / 150) * 100);

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-28 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft text-accent">
          <ShoppingBag size={26} />
        </span>
        <h1 className="h2 mt-6">Your cart is empty</h1>
        <p className="mt-2 text-[15px] text-muted">
          Browse the marketplace and find something considered.
        </p>
        <LinkButton href="/marketplace" size="lg" className="mt-8">
          Start shopping <ArrowRight size={16} />
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="h1">Your cart</h1>
      <p className="mt-2 text-[15px] text-muted">
        {items.length} {items.length === 1 ? "item" : "items"} from {groups.length}{" "}
        {groups.length === 1 ? "vendor" : "vendors"}
      </p>

      {/* free shipping progress */}
      <div className="mt-8 rounded-2xl border border-line bg-surface p-5">
        <div className="flex items-center gap-2.5 text-sm">
          <Truck size={17} className="shrink-0 text-accent" />
          {freeGap > 0 ? (
            <span>
              You&apos;re <b>{money(freeGap)}</b> away from free shipping
            </span>
          ) : (
            <span className="font-semibold text-success">
              You&apos;ve unlocked free shipping 🎉
            </span>
          )}
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-muted">
          <motion.div
            className="h-full rounded-full bg-accent"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        {/* vendor groups */}
        <div className="space-y-6">
          {groups.map(([vendorId, lines]) => {
            const vendorSubtotal = lines.reduce(
              (n, i) => n + i.product.price * i.line.qty,
              0
            );
            const vendorName = lines[0].vendorName;
            return (
              <section key={vendorId} className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
                <header className="flex items-center justify-between border-b border-line bg-surface-muted/50 px-5 py-3.5">
                  <Link href={vendorHref(lines[0].vendorSlug)} className="text-[13px] font-bold tracking-wide hover:text-accent">
                    {vendorName}
                  </Link>
                  <Badge>Subtotal {money(vendorSubtotal)}</Badge>
                </header>
                <AnimatePresence initial={false}>
                  {lines.map((i) => (
                    <motion.div
                      key={i.line.slug}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex gap-4 border-b border-line px-5 py-4 last:border-0"
                    >
                      <Link href={productHref(i.product.slug)} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-muted">
                        <SmartImage src={i.product.img} alt={i.product.name} sizes="80px" />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <Link href={productHref(i.product.slug)} className="line-clamp-2 text-sm font-semibold hover:text-accent">
                            {i.product.name}
                          </Link>
                          <p className="tabular shrink-0 text-sm font-bold">
                            {money(i.product.price * i.line.qty)}
                          </p>
                        </div>
                        <p className="mt-0.5 text-[12px] text-muted">
                          {money(i.product.price)} each
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="inline-flex h-8 items-center rounded-full border border-line">
                            <button
                              aria-label="Decrease"
                              className="flex h-8 w-8 items-center justify-center rounded-l-full text-muted hover:text-foreground disabled:opacity-40"
                              onClick={() => setCartQty(i.line.slug, i.line.qty - 1)}
                              disabled={i.line.qty <= 1}
                            >
                              <Minus size={13} />
                            </button>
                            <span className="tabular w-6 text-center text-[13px] font-semibold">{i.line.qty}</span>
                            <button
                              aria-label="Increase"
                              className="flex h-8 w-8 items-center justify-center rounded-r-full text-muted hover:text-foreground"
                              onClick={() => setCartQty(i.line.slug, i.line.qty + 1)}
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(i.line.slug)}
                            className="flex items-center gap-1.5 text-[12px] font-medium text-muted transition-colors hover:text-danger"
                          >
                            <Trash2 size={13} /> Remove
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </section>
            );
          })}
        </div>

        {/* summary */}
        <aside>
          <div className="sticky top-32 rounded-2xl border border-line bg-surface p-6 shadow-card">
            <h2 className="h3">Order summary</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="tabular font-semibold">{money(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Shipping</dt>
                <dd className="tabular font-semibold">
                  {shipping === 0 ? (
                    <span className="text-success">Free</span>
                  ) : (
                    money(shipping)
                  )}
                </dd>
              </div>
              <div className="flex justify-between border-t border-line pt-3 text-base">
                <dt className="font-bold">Total</dt>
                <dd className="tabular font-extrabold">{money(total)}</dd>
              </div>
            </dl>
            <LinkButton href="/checkout" size="lg" className="mt-6 w-full">
              Checkout <ArrowRight size={16} />
            </LinkButton>
            <Link
              href="/marketplace"
              className="mt-3 block text-center text-[13px] font-medium text-muted hover:text-accent"
            >
              Continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
