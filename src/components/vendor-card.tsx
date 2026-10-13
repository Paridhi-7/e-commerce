"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Star } from "lucide-react";
import type { Vendor } from "@/lib/types";
import { vendorHref } from "@/lib/format";
import { SmartImage } from "./ui";

export function VendorCard({
  vendor,
  index = 0,
  compact = false,
}: {
  vendor: Vendor;
  index?: number;
  compact?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.36), ease: [0.21, 0.6, 0.35, 1] }}
    >
      <Link
        href={vendorHref(vendor.slug)}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
      >
        <div className="relative h-28 overflow-hidden bg-surface-muted sm:h-32">
          <SmartImage
            src={vendor.banner}
            alt={`${vendor.name} storefront`}
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
          <div className="absolute -bottom-5 left-4 h-12 w-12 overflow-hidden rounded-xl border-2 border-surface bg-surface shadow-md">
            <SmartImage
              src={vendor.logo}
              alt={vendor.name}
              sizes="48px"
              className="object-cover"
            />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-1 px-4 pb-4 pt-7">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-bold tracking-tight">{vendor.name}</h3>
            <span className="flex shrink-0 items-center gap-1 text-xs text-muted">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <span className="font-semibold text-foreground">{vendor.rating.toFixed(1)}</span>
            </span>
          </div>
          <p className="line-clamp-1 text-[13px] text-muted">{vendor.tagline}</p>
          {!compact && (
            <div className="mt-auto flex items-center justify-between pt-3 text-[12px] text-subtle">
              <span className="flex items-center gap-1">
                <MapPin size={12} /> {vendor.location}
              </span>
              <span>{vendor.products} products</span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
