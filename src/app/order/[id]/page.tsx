"use client";

import Link from "next/link";
import { use, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, MapPin, Package, Truck } from "lucide-react";
import { ordersStore, useStore } from "@/lib/shop";
import { money, longDate, vendorHref } from "@/lib/format";
import {
  getCatalogVendor as getVendor,
  getCatalogProduct as getProduct,
  productImage,
  useCatalog,
} from "@/lib/catalog";
import { SmartImage } from "@/components/ui";
import { LinkButton, Badge } from "@/components/buttons";

export default function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  useCatalog(); // subscribe so product/vendor lookups resolve from MongoDB
  const orders = useStore(ordersStore);
  const order = useMemo(() => orders.find((o) => o.id === id) ?? null, [orders, id]);

  if (!order) {
    return (
      <div className="mx-auto max-w-md px-4 py-28 text-center">
        <h1 className="h2">Order not found</h1>
        <p className="mt-2 text-[15px] text-muted">
          This order belongs to a different browser session. Place a new order to see the
          full flow.
        </p>
        <LinkButton href="/marketplace" className="mt-8">
          Browse marketplace
        </LinkButton>
      </div>
    );
  }

  const groups = new Map<string, typeof order.lines>();
  for (const line of order.lines) {
    const arr = groups.get(line.vendorId) ?? [];
    arr.push(line);
    groups.set(line.vendorId, arr);
  }

  const steps = ["Confirmed", "Packed", "Shipped", "Delivered"];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      {/* success hero */}
      <div className="text-center">
        <motion.span
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-success-soft text-success"
        >
          <CheckCircle2 size={32} />
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="h1 mt-6"
        >
          Thank you — order confirmed
        </motion.h1>
        <p className="mt-3 text-[15px] text-muted">
          Order <b className="text-foreground">{order.id}</b> · placed {longDate(order.placedAt)}
        </p>
      </div>

      {/* timeline */}
      <div className="mt-10 rounded-2xl border border-line bg-surface p-6 shadow-card">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.12 }}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold ${
                    i === 0 ? "bg-accent text-white" : "bg-surface-muted text-subtle"
                  }`}
                >
                  {i === 0 ? <CheckCircle2 size={15} /> : i + 1}
                </motion.span>
                <span className={`text-[11px] font-semibold ${i === 0 ? "text-foreground" : "text-subtle"}`}>
                  {s}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="mx-2 mb-5 h-0.5 flex-1 rounded bg-surface-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: i === 0 ? "35%" : "0%" }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="h-full rounded bg-accent"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5 text-sm">
          <span className="flex items-center gap-2 text-muted">
            <Truck size={16} className="text-accent" />
            Estimated delivery <b className="text-foreground">{longDate(order.eta)}</b>
          </span>
          <Badge tone="success">
            <Package size={12} /> {groups.size} {groups.size === 1 ? "shipment" : "shipments"}
          </Badge>
        </div>
      </div>

      {/* shipments by vendor */}
      <div className="mt-8 space-y-6">
        {[...groups.entries()].map(([vendorId, lines], gi) => {
          const vendor = getVendor(vendorId);
          return (
            <motion.section
              key={vendorId}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + gi * 0.1 }}
              className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card"
            >
              <header className="flex items-center justify-between border-b border-line bg-surface-muted/50 px-5 py-3.5">
                <Link href={vendorHref(vendor?.slug ?? "#")} className="text-[13px] font-bold hover:text-accent">
                  Shipment {gi + 1} · {vendor?.name}
                </Link>
                <Badge tone="accent">Ships from {vendor?.location.split(",").pop()?.trim()}</Badge>
              </header>
              <div className="divide-y divide-line">
                {lines.map((l) => {
                  const product = getProduct(l.slug);
                  return (
                    <div key={l.slug} className="flex items-center gap-4 px-5 py-4">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-muted">
                        <SmartImage src={productImage(l.slug)} alt="" sizes="64px" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link href={`/product/${l.slug}`} className="line-clamp-1 text-sm font-semibold hover:text-accent">
                          {product?.name ?? l.slug}
                        </Link>
                        <p className="mt-0.5 text-[12px] text-muted">
                          Qty {l.qty} · {money(l.price)} each
                        </p>
                      </div>
                      <p className="tabular text-sm font-bold">{money(l.price * l.qty)}</p>
                    </div>
                  );
                })}
              </div>
            </motion.section>
          );
        })}
      </div>

      {/* address + totals */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h3 className="flex items-center gap-2 text-sm font-bold">
            <MapPin size={15} className="text-accent" /> Delivery address
          </h3>
          <address className="mt-3 text-sm not-italic leading-relaxed text-muted">
            <b className="text-foreground">{order.address.name}</b>
            <br />
            {order.address.street}
            <br />
            {order.address.city} {order.address.zip}
            <br />
            {order.address.phone}
          </address>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h3 className="text-sm font-bold">Payment & total</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Paid with</dt>
              <dd className="font-semibold">{order.payment}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Items</dt>
              <dd className="tabular font-semibold">{order.lines.reduce((n, l) => n + l.qty, 0)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-2">
              <dt className="font-bold">Total</dt>
              <dd className="tabular font-extrabold">{money(order.total)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-10 text-center">
        <LinkButton href="/account" size="lg">
          View order history <ArrowRight size={16} />
        </LinkButton>
      </div>
    </div>
  );
}
