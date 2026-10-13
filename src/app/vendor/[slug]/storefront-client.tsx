"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Award,
  CalendarDays,
  MapPin,
  MessageCircle,
  Package,
  RotateCcw,
  Star,
  Truck,
} from "lucide-react";
import type { Product, Vendor } from "@/lib/types";
import { SmartImage } from "@/components/ui";
import { Button, Badge } from "@/components/buttons";
import { ProductCard } from "@/components/product-card";

export function VendorStorefront({
  vendor,
  products,
}: {
  vendor: Vendor;
  products: Product[];
}) {
  const [tab, setTab] = useState<"products" | "about">("products");
  const [following, setFollowing] = useState(false);

  return (
    <div>
      {/* banner */}
      <div className="relative h-52 w-full overflow-hidden sm:h-72">
        <SmartImage
          src={vendor.banner}
          alt={`${vendor.name} banner`}
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* identity card */}
        <div className="relative -mt-14 rounded-3xl border border-line bg-surface p-6 shadow-panel sm:-mt-16 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-4 border-surface shadow-md sm:h-24 sm:w-24">
              <SmartImage src={vendor.logo} alt={vendor.name} sizes="96px" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="h2">{vendor.name}</h1>
                {vendor.rating >= 4.8 && (
                  <Badge tone="accent">
                    <Award size={12} /> Top rated
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-[15px] text-muted">{vendor.tagline}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-muted">
                <span className="flex items-center gap-1.5">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <b className="text-foreground">{vendor.rating.toFixed(1)}</b> rating
                </span>
                <span className="flex items-center gap-1.5">
                  <Package size={14} /> {products.length} products
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} /> {vendor.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={14} /> Since {vendor.memberSince}
                </span>
              </div>
            </div>
            <div className="flex gap-2.5">
              <Button
                variant={following ? "outline" : "primary"}
                onClick={() => setFollowing((v) => !v)}
              >
                {following ? "Following ✓" : "Follow store"}
              </Button>
              <Button variant="outline" aria-label="Message vendor">
                <MessageCircle size={16} />
              </Button>
            </div>
          </div>

          {/* stats strip */}
          <div className="mt-7 grid grid-cols-3 divide-x divide-line rounded-2xl border border-line bg-surface-muted/50">
            {[
              [vendor.followers, "followers"],
              [`${products.length}`, "products"],
              [`${Math.round(vendor.rating * 10) / 10}★`, "avg rating"],
            ].map(([v, l]) => (
              <div key={l} className="px-4 py-4 text-center">
                <p className="tabular text-lg font-extrabold">{v}</p>
                <p className="text-[12px] text-muted">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* tabs */}
        <div className="mt-10 flex gap-6 border-b border-line">
          {(["products", "about"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative pb-3 text-sm font-semibold capitalize transition-colors ${
                tab === t ? "text-foreground" : "text-muted hover:text-foreground"
              }`}
            >
              {t === "products" ? `Products (${products.length})` : "About & policies"}
              {tab === t && (
                <motion.span
                  layoutId="vendor-tab"
                  className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent"
                />
              )}
            </button>
          ))}
        </div>

        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="py-10"
        >
          {tab === "products" ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
              {products.map((p, i) => (
                <ProductCard key={p.slug} product={p} index={i} />
              ))}
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
              <div>
                <h3 className="h3">Our story</h3>
                <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
                  {vendor.description}
                </p>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {[
                    { icon: Truck, title: "Shipping", body: "Dispatched within 1–2 business days from our studio. Tracked worldwide." },
                    { icon: RotateCcw, title: "Returns", body: "30 days from delivery. Items must be unused; we cover return label for defects." },
                    { icon: MessageCircle, title: "Questions", body: "We answer messages within one business day — usually faster." },
                    { icon: Package, title: "Packaging", body: "Plastic-free, recyclable packaging on every order." },
                  ].map((c) => (
                    <div key={c.title} className="rounded-2xl border border-line bg-surface p-5">
                      <c.icon size={18} className="text-accent" />
                      <p className="mt-3 text-sm font-bold">{c.title}</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-muted">{c.body}</p>
                    </div>
                  ))}
                </div>
              </div>
              <aside className="rounded-3xl border border-line bg-surface p-6 shadow-card">
                <h3 className="h3">At a glance</h3>
                <dl className="mt-4 divide-y divide-line text-sm">
                  {[
                    ["Location", vendor.location],
                    ["On KARTIFY since", vendor.memberSince],
                    ["Rating", `${vendor.rating.toFixed(1)} / 5`],
                    ["Products", `${products.length}`],
                    ["Followers", vendor.followers],
                    ["Ships from", vendor.location.split(",").pop()?.trim() ?? "—"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 py-3">
                      <dt className="text-muted">{k}</dt>
                      <dd className="font-semibold">{v}</dd>
                    </div>
                  ))}
                </dl>
              </aside>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
