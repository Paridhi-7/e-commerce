"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useCatalog } from "@/lib/catalog";
import { VendorCard } from "@/components/vendor-card";

export default function VendorsPage() {
  const [q, setQ] = useState("");
  const { vendors } = useCatalog();
  const filtered = useMemo(() => {
    const approved = vendors.filter((v) => v.status === "approved");
    if (!q.trim()) return approved;
    const needle = q.toLowerCase();
    return approved.filter(
      (v) =>
        v.name.toLowerCase().includes(needle) ||
        v.tagline.toLowerCase().includes(needle) ||
        v.location.toLowerCase().includes(needle)
    );
  }, [q, vendors]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-xl">
        <p className="eyebrow text-accent">Storefronts</p>
        <h1 className="h1 mt-2">Meet the vendors</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          Independent studios and workshops from around the world, each with their own
          storefront, catalog and story.
        </p>
      </div>

      <div className="relative mt-8 max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search vendors by name, craft or location…"
          className="h-12 w-full rounded-2xl border border-line bg-surface pl-11 pr-4 text-sm outline-none transition-all placeholder:text-subtle focus:border-accent-border focus:ring-4 focus:ring-accent/10"
        />
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((v, i) => (
          <VendorCard key={v.id} vendor={v} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-20 text-center text-sm text-muted">
          No vendors match “{q}”. Try another search.
        </p>
      )}
    </div>
  );
}
