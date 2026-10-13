"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Star } from "lucide-react";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { useCatalog, getCatalogVendor as getVendor } from "@/lib/catalog";
import { money, productHref, vendorHref } from "@/lib/format";
import { toggleWishlist, useStore, wishlistStore } from "@/lib/shop";
import { SmartImage } from "./ui";
import { productImage, productImages } from "@/lib/catalog";

const badgeTone: Record<string, string> = {
  Bestseller: "bg-foreground text-white",
  New: "bg-accent-soft text-accent",
  Limited: "bg-warning-soft text-warning",
  Sale: "bg-danger-soft text-danger",
};

export function ProductCard({
  product,
  index = 0,
  priority = false,
}: {
  product: Product;
  index?: number;
  priority?: boolean;
}) {
  useCatalog(); // subscribe so images/vendor resolve as soon as the API responds
  const vendor = getVendor(product.vendorId);
  const wishlist = useStore(wishlistStore);
  const saved = useMemo(
    () => wishlist.some((l) => l.slug === product.slug),
    [wishlist, product.slug]
  );
  const [hover, setHover] = useState(false);
  const images = productImages(product.slug);
  const shown = hover && images[1] ? images[1] : productImage(product.slug);
  const discount =
    product.compareAt && product.compareAt > product.price
      ? Math.round((1 - product.price / product.compareAt) * 100)
      : 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.4), ease: [0.21, 0.6, 0.35, 1] }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
    >
      <Link href={productHref(product.slug)} className="relative block aspect-square overflow-hidden bg-surface-muted">
        <SmartImage
          src={shown}
          alt={product.name}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          priority={priority}
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.badge && (
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide ${badgeTone[product.badge]}`}>
              {product.badge.toUpperCase()}
            </span>
          )}
          {discount > 0 && (
            <span className="rounded-full bg-surface/90 px-2.5 py-1 text-[10px] font-bold text-danger backdrop-blur">
              −{discount}%
            </span>
          )}
        </div>
        <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-2 rounded-full bg-foreground/85 px-4 py-1.5 text-[11px] font-semibold text-white opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          View details
        </span>
      </Link>

      <button
        type="button"
        aria-label={saved ? "Remove from saved" : "Save for later"}
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist(product.slug);
        }}
        className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full shadow-sm transition-all duration-200 ${
          saved
            ? "bg-danger-soft text-danger"
            : "bg-surface/90 text-muted backdrop-blur hover:text-danger"
        }`}
      >
        <Heart size={15} className={saved ? "fill-danger" : ""} />
      </button>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <Link
          href={vendorHref(vendor?.slug ?? "#")}
          className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted transition-colors hover:text-accent"
        >
          {vendor?.name ?? "Independent"}
        </Link>
        <Link href={productHref(product.slug)} className="line-clamp-1 text-sm font-semibold leading-snug">
          {product.name}
        </Link>
        <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-muted">
          <Star size={12} className="fill-amber-400 text-amber-400" />
          <span className="font-semibold text-foreground">{product.rating.toFixed(1)}</span>
          <span>({product.reviews})</span>
        </div>
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="tabular text-[15px] font-bold">{money(product.price)}</span>
          {product.compareAt && product.compareAt > product.price && (
            <span className="tabular text-[12px] text-subtle line-through">
              {money(product.compareAt)}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
