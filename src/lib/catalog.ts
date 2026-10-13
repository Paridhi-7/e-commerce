"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createStore } from "./store";
import type { Product, Vendor } from "./types";

interface CatalogData {
  products: Product[];
  vendors: Vendor[];
}

const catalogStore = createStore<CatalogData>({ products: [], vendors: [] });

let loadPromise: Promise<void> | null = null;

/** Fetches products + vendors from the MongoDB-backed API once per page load. */
export function loadCatalog(): Promise<void> {
  if (!loadPromise) {
    loadPromise = fetch("/api/catalog", { cache: "no-store" })
      .then((r) => r.json())
      .then(({ products, vendors }: CatalogData) =>
        catalogStore.set({ products: products ?? [], vendors: vendors ?? [] })
      )
      .catch((err) => {
        console.error("Failed to load catalog", err);
        loadPromise = null;
      });
  }
  return loadPromise;
}

/** Subscribe + access the catalog from a client component. */
export function useCatalog(): CatalogData {
  useEffect(() => {
    loadCatalog();
  }, []);
  return useSyncExternalStore(catalogStore.subscribe, catalogStore.get, catalogStore.get);
}

export function getCatalogProduct(slug: string): Product | undefined {
  return catalogStore.get().products.find((p) => p.slug === slug);
}

export function getCatalogVendor(id: string): Vendor | undefined {
  return catalogStore.get().vendors.find((v) => v.id === id);
}

export function getCatalogVendorBySlug(slug: string): Vendor | undefined {
  return catalogStore.get().vendors.find((v) => v.slug === slug);
}

export function productImage(slug: string): string {
  return getCatalogProduct(slug)?.img ?? "";
}

export function productImages(slug: string): string[] {
  const p = getCatalogProduct(slug);
  if (!p) return [];
  return [p.img, p.alt1, p.alt2].filter(Boolean) as string[];
}
