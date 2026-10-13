"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { CATEGORIES } from "@/lib/products";
import type { Product, Vendor } from "@/lib/types";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/buttons";
import { Rating } from "@/components/ui";

const SORTS = [
  { value: "popular", label: "Most popular" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

const PRICE_BANDS = [
  { key: "u50", label: "Under $50", min: 0, max: 50 },
  { key: "50-150", label: "$50 – $150", min: 50, max: 150 },
  { key: "150-300", label: "$150 – $300", min: 150, max: 300 },
  { key: "300p", label: "$300+", min: 300, max: Infinity },
];

export function MarketplaceClient({
  initialCategory,
  initialVendor,
  initialQuery,
  initialSort,
  products,
  vendors,
}: {
  initialCategory?: string;
  initialVendor?: string;
  initialQuery?: string;
  initialSort?: string;
  products: Product[];
  vendors: Vendor[];
}) {
  const router = useRouter();
  const [category, setCategory] = useState(initialCategory ?? "All");
  const [vendorId, setVendorId] = useState(initialVendor ?? "all");
  const [band, setBand] = useState<string | null>(null);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState(initialSort ?? "popular");
  const [query, setQuery] = useState(initialQuery ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const approvedVendors = vendors.filter((v) => v.status === "approved");

  const results = useMemo(() => {
    let list = [...products];
    if (category !== "All") list = list.filter((p) => p.category === category);
    if (vendorId !== "all") list = list.filter((p) => p.vendorId === vendorId);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q)
      );
    }
    if (band) {
      const b = PRICE_BANDS.find((x) => x.key === band);
      if (b) list = list.filter((p) => p.price >= b.min && p.price < Number.MAX_SAFE_INTEGER);
    }
    if (minRating > 0) list = list.filter((p) => p.rating >= minRating);

    switch (sort) {
      case "newest":
        list.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      default:
        list.sort((a, b) => b.reviews * b.rating - a.reviews * a.rating);
    }
    return list;
  }, [category, vendorId, band, minRating, sort, query, products]);

  const activeCount =
    (category !== "All" ? 1 : 0) +
    (vendorId !== "all" ? 1 : 0) +
    (band ? 1 : 0) +
    (minRating > 0 ? 1 : 0);

  const reset = () => {
    setCategory("All");
    setVendorId("all");
    setBand(null);
    setMinRating(0);
    setQuery("");
    setSort("popular");
    router.replace("/marketplace");
  };

  const filterPanel = (
    <div className="space-y-7">
      <div>
        <p className="mb-3 text-[13px] font-bold">Category</p>
        <div className="space-y-1.5">
          {["All", ...CATEGORIES.map((c) => c.name)].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                category === c
                  ? "bg-accent-soft font-semibold text-accent"
                  : "text-muted hover:bg-surface-muted hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-[13px] font-bold">Price</p>
        <div className="space-y-1.5">
          {PRICE_BANDS.map((b) => (
            <label key={b.key} className="flex cursor-pointer items-center gap-2.5 text-sm text-muted hover:text-foreground">
              <input
                type="radio"
                name="price"
                checked={band === b.key}
                onChange={() => setBand(band === b.key ? null : b.key)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              {b.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-[13px] font-bold">Vendor</p>
        <select
          value={vendorId}
          onChange={(e) => setVendorId(e.target.value)}
          className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent-border"
        >
          <option value="all">All vendors</option>
          {approvedVendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="mb-3 text-[13px] font-bold">Rating</p>
        <div className="space-y-1.5">
          {[4.8, 4.5, 4].map((r) => (
            <button
              key={r}
              onClick={() => setMinRating(minRating === r ? 0 : r)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                minRating === r ? "bg-accent-soft font-semibold text-accent" : "text-muted hover:bg-surface-muted"
              }`}
            >
              <Rating value={r} size={13} />
              <span>&amp; up</span>
            </button>
          ))}
        </div>
      </div>

      {activeCount > 0 && (
        <Button variant="outline" size="sm" className="w-full" onClick={reset}>
          Clear all filters ({activeCount})
        </Button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-accent">Marketplace</p>
          <h1 className="h1 mt-2">Browse everything</h1>
          <p className="mt-2 text-[15px] text-muted">
            {results.length} {results.length === 1 ? "product" : "products"} from{" "}
            {approvedVendors.length} independent vendors
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFiltersOpen(true)}
            className="flex h-11 items-center gap-2 rounded-full border border-line-strong bg-surface px-4 text-sm font-semibold lg:hidden"
          >
            <SlidersHorizontal size={15} />
            Filters
            {activeCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white">
                {activeCount}
              </span>
            )}
          </button>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-11 appearance-none rounded-full border border-line-strong bg-surface pl-4 pr-10 text-sm font-semibold outline-none focus:border-accent-border"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-subtle" />
          </div>
        </div>
      </div>

      {/* search */}
      <div className="relative mt-6 max-w-xl">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products, tags, categories…"
          className="h-12 w-full rounded-2xl border border-line bg-surface pl-11 pr-4 text-sm outline-none transition-all placeholder:text-subtle focus:border-accent-border focus:ring-4 focus:ring-accent/10"
        />
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[240px_1fr]">
        {/* sidebar (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-32">{filterPanel}</div>
        </aside>

        {/* grid */}
        <div>
          {results.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-line-strong py-24 text-center">
              <p className="text-lg font-bold">No products match those filters</p>
              <p className="text-sm text-muted">Try widening the price range or clearing a filter.</p>
              <Button variant="soft" size="sm" onClick={reset} className="mt-2">
                Clear filters
              </Button>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {results.map((p, i) => (
                  <ProductCard key={p.slug} product={p} index={Math.min(i, 8)} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* mobile filter sheet */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFiltersOpen(false)}
              className="fixed inset-0 z-[60] bg-foreground/40 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 left-0 z-[61] w-[300px] overflow-y-auto bg-surface p-6 shadow-pop lg:hidden"
            >
              <div className="mb-6 flex items-center justify-between">
                <p className="text-base font-bold">Filters</p>
                <button onClick={() => setFiltersOpen(false)} aria-label="Close filters">
                  <X size={20} />
                </button>
              </div>
              {filterPanel}
              <Button className="mt-8 w-full" onClick={() => setFiltersOpen(false)}>
                Show {results.length} results
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
