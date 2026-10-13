"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Heart,
  MapPin,
  RotateCcw,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import Link from "next/link";
import type { Product, Review, Vendor } from "@/lib/types";
import { money, vendorHref } from "@/lib/format";
import { addToCart, toggleWishlist, useStore, wishlistStore } from "@/lib/shop";
import { SmartImage, QtyStepper, Rating } from "@/components/ui";
import { Button, Badge } from "@/components/buttons";
import { ProductCard } from "@/components/product-card";

export function ProductDetailClient({
  product,
  vendor,
  related,
  initialReviews,
}: {
  product: Product;
  vendor: Vendor | null;
  related: Product[];
  initialReviews: Review[];
}) {
  const images = [product.img, product.alt1, product.alt2].filter(Boolean) as string[];
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"details" | "reviews">("details");
  const wishlist = useStore(wishlistStore);
  const saved = wishlist.some((l) => l.slug === product.slug);
  const [added, setAdded] = useState(false);
  const stockLow = product.stock <= 10;

  const onAdd = () => {
    addToCart(product.slug, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      {/* breadcrumbs */}
      <nav className="flex items-center gap-2 text-[13px] text-muted">
        <Link href="/marketplace" className="hover:text-foreground">Marketplace</Link>
        <span>/</span>
        <Link href={`/marketplace?category=${encodeURIComponent(product.category)}`} className="hover:text-foreground">
          {product.category}
        </Link>
        <span>/</span>
        <span className="truncate text-foreground">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        {/* gallery */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-line bg-surface-muted shadow-card">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 1.015 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <SmartImage
                  src={images[active] ?? product.img}
                  alt={product.name}
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                  priority
                />
              </motion.div>
            </AnimatePresence>
            {product.badge && (
              <span className="absolute left-4 top-4 rounded-full bg-foreground px-3 py-1.5 text-[11px] font-bold text-white">
                {product.badge.toUpperCase()}
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {images.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setActive(i)}
                  className={`relative aspect-square w-20 overflow-hidden rounded-xl border-2 transition-all ${
                    active === i ? "border-accent" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                  aria-label={`View image ${i + 1}`}
                >
                  <SmartImage src={src} alt="" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* info */}
        <div>
          <div className="flex items-center gap-3">
            <Link href={vendorHref(vendor?.slug ?? "#")} className="group flex items-center gap-2.5">
              <span className="relative h-9 w-9 overflow-hidden rounded-lg border border-line">
                <SmartImage src={vendor?.logo ?? ""} alt={vendor?.name ?? ""} sizes="36px" />
              </span>
              <span className="text-[13px] font-bold tracking-wide text-muted transition-colors group-hover:text-accent">
                {vendor?.name}
              </span>
            </Link>
            {vendor && (
              <span className="flex items-center gap-1 text-[12px] text-subtle">
                <MapPin size={12} /> {vendor.location}
              </span>
            )}
          </div>

          <h1 className="h1 mt-4">{product.name}</h1>

          <div className="mt-3 flex items-center gap-3 text-sm">
            <Rating value={product.rating} size={16} />
            <span className="font-semibold">{product.rating.toFixed(1)}</span>
            <button
              onClick={() => setTab("reviews")}
              className="text-muted underline-offset-2 hover:text-accent hover:underline"
            >
              {product.reviews} reviews
            </button>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="tabular text-3xl font-extrabold tracking-tight">{money(product.price)}</span>
            {product.compareAt && product.compareAt > product.price && (
              <>
                <span className="tabular text-lg text-subtle line-through">{money(product.compareAt)}</span>
                <Badge tone="danger">
                  Save {money(product.compareAt - product.price)}
                </Badge>
              </>
            )}
          </div>

          <p className="mt-5 text-[15px] leading-relaxed text-muted">{product.description}</p>

          <ul className="mt-6 space-y-2">
            {product.features.slice(0, 4).map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/85">
                <Check size={16} className="mt-0.5 shrink-0 text-success" />
                {f}
              </li>
            ))}
          </ul>

          {/* stock */}
          <p className={`mt-6 text-[13px] font-medium ${stockLow ? "text-warning" : "text-success"}`}>
            {stockLow ? `Only ${product.stock} left in stock` : "In stock, ships in 1–2 days"}
          </p>

          {/* actions */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <QtyStepper value={qty} onChange={setQty} max={product.stock} />
            <Button size="lg" onClick={onAdd} className="min-w-[200px] flex-1 sm:flex-none">
              <AnimatePresence mode="wait" initial={false}>
                {added ? (
                  <motion.span
                    key="added"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center gap-2"
                  >
                    <Check size={17} /> Added
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center gap-2"
                  >
                    Add to cart · {money(product.price * qty)}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
            <button
              onClick={() => toggleWishlist(product.slug)}
              aria-label={saved ? "Remove from saved" : "Save for later"}
              className={`flex h-[52px] w-[52px] items-center justify-center rounded-full border transition-all ${
                saved
                  ? "border-danger/30 bg-danger-soft text-danger"
                  : "border-line-strong text-muted hover:border-danger/40 hover:text-danger"
              }`}
            >
              <Heart size={19} className={saved ? "fill-danger" : ""} />
            </button>
          </div>

          {/* trust row */}
          <div className="mt-8 grid grid-cols-1 gap-3 rounded-2xl border border-line bg-surface p-4 sm:grid-cols-3">
            {[
              { icon: Truck, label: "Free shipping", sub: "Orders over $150" },
              { icon: RotateCcw, label: "30-day returns", sub: "No questions asked" },
              { icon: ShieldCheck, label: "Buyer protection", sub: "On every order" },
            ].map((t) => (
              <div key={t.label} className="flex items-center gap-3">
                <t.icon size={18} className="shrink-0 text-accent" />
                <div>
                  <p className="text-[13px] font-bold">{t.label}</p>
                  <p className="text-[12px] text-muted">{t.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* tabs */}
          <div className="mt-10">
            <div className="flex gap-6 border-b border-line">
              {(["details", "reviews"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`relative pb-3 text-sm font-semibold capitalize transition-colors ${
                    tab === t ? "text-foreground" : "text-muted hover:text-foreground"
                  }`}
                >
                  {t === "reviews" ? `Reviews (${initialReviews.length})` : "Details"}
                  {tab === t && (
                    <motion.span
                      layoutId="product-tab"
                      className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent"
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="pt-6">
              {tab === "details" ? (
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <p className="text-[13px] font-bold uppercase tracking-wide text-subtle">Specifications</p>
                    <dl className="mt-3 divide-y divide-line">
                      {Object.entries(product.details).map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-4 py-2.5 text-sm">
                          <dt className="text-muted">{k}</dt>
                          <dd className="text-right font-medium">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold uppercase tracking-wide text-subtle">About this product</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted">{product.description}</p>
                    <ul className="mt-4 space-y-2">
                      {product.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-foreground/85">
                          <Check size={15} className="mt-0.5 shrink-0 text-success" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <ReviewsPanel
                  productSlug={product.slug}
                  reviews={initialReviews}
                  rating={product.rating}
                  count={product.reviews}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* related */}
      {related.length > 0 && (
        <section className="mt-20 border-t border-line pt-12">
          <h2 className="h2">You may also like</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p.slug} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ReviewForm({
  productSlug,
  onAdded,
}: {
  productSlug: string;
  onAdded: () => void;
}) {
  const [form, setForm] = useState({ author: "", title: "", body: "", rating: 5 });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!form.author.trim() || !form.title.trim() || !form.body.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug, ...form }),
      });
      if (res.ok) {
        setDone(true);
        setForm({ author: "", title: "", body: "", rating: 5 });
        onAdded();
      }
    } finally {
      setBusy(false);
      setTimeout(() => setDone(false), 2500);
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-surface-muted/40 p-5">
      <p className="text-sm font-bold">Write a review</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <input
          value={form.author}
          onChange={(e) => setForm({ ...form, author: e.target.value })}
          placeholder="Your name"
          className="h-11 rounded-xl border border-line bg-surface px-3.5 text-sm outline-none focus:border-accent-border"
        />
        <select
          value={form.rating}
          onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
          className="h-11 rounded-xl border border-line bg-surface px-3.5 text-sm outline-none focus:border-accent-border"
        >
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} star{r > 1 ? "s" : ""}
            </option>
          ))}
        </select>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Review title"
          className="h-11 rounded-xl border border-line bg-surface px-3.5 text-sm outline-none focus:border-accent-border sm:col-span-2"
        />
        <textarea
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          placeholder="What did you think?"
          rows={3}
          className="rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-accent-border sm:col-span-2"
        />
      </div>
      <Button className="mt-3" size="sm" onClick={submit} disabled={busy}>
        {busy ? "Sending…" : done ? "Saved to database ✓" : "Post review"}
      </Button>
    </div>
  );
}

function ReviewsPanel({
  productSlug,
  reviews: initial,
  rating,
  count,
}: {
  productSlug: string;
  reviews: Review[];
  rating: number;
  count: number;
}) {
  const [reviews, setReviews] = useState(initial);

  const refetch = () => {
    fetch(`/api/reviews?productSlug=${encodeURIComponent(productSlug)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then(({ reviews }: { reviews: Review[] }) => setReviews(reviews))
      .catch(() => undefined);
  };

  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    pct: reviews.length
      ? Math.round((reviews.filter((r) => Math.round(r.rating) === star).length / reviews.length) * 100)
      : 0,
  }));

  return (
    <div>
      <div className="grid gap-8 rounded-2xl border border-line bg-surface p-6 sm:grid-cols-[auto_1fr]">
        <div className="text-center sm:pr-8">
          <p className="tabular text-5xl font-extrabold tracking-tight">{rating.toFixed(1)}</p>
          <Rating value={rating} size={16} className="mt-2 justify-center" />
          <p className="mt-1 text-[13px] text-muted">{count} verified ratings</p>
        </div>
        <div className="space-y-2 self-center">
          {dist.map((d) => (
            <div key={d.star} className="flex items-center gap-3 text-[13px]">
              <span className="flex w-10 items-center gap-1 text-muted">
                {d.star} <Star size={11} className="fill-amber-400 text-amber-400" />
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${d.pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full bg-amber-400"
                />
              </div>
              <span className="tabular w-10 text-right text-subtle">{d.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <ReviewForm productSlug={productSlug} onAdded={refetch} />
      </div>

      <div className="mt-8 space-y-6">
        {reviews.length === 0 && (
          <p className="text-sm text-muted">
            No written reviews yet for this product — be the first after purchase.
          </p>
        )}
        {reviews.map((r) => (
          <article key={r.id} className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-[12px] font-bold text-accent">
                  {r.avatarSeed}
                </span>
                <div>
                  <p className="text-sm font-bold">{r.author}</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <Rating value={r.rating} size={12} />
                    {r.verified && <span className="text-[11px] font-semibold text-success">Verified purchase</span>}
                  </div>
                </div>
              </div>
              <span className="text-[12px] text-subtle">{r.date}</span>
            </div>
            <h4 className="mt-3 text-sm font-bold">{r.title}</h4>
            <p className="mt-1 text-sm leading-relaxed text-muted">{r.body}</p>
            <p className="mt-3 text-[12px] text-subtle">{r.helpful} people found this helpful</p>
          </article>
        ))}
      </div>
    </div>
  );
}
