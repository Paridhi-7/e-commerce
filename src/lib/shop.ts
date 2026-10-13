"use client";

import { useEffect } from "react";
import { createStore, useStore } from "./store";
import { loadCatalog, getCatalogProduct, productImage } from "./catalog";
import type {
  DetailedLine,
  PlacedOrder,
  SafeUser,
  Toast,
  WishlistItem,
  WishlistLine,
} from "./types";

/* ---------------- cart ---------------- */

export const cartStore = createStore<DetailedLine[]>([]);

export function hydrateCart() {
  fetch("/api/cart", { cache: "no-store" })
    .then((r) => r.json())
    .then(({ lines }: { lines: DetailedLine[] }) => cartStore.set(lines ?? []))
    .catch((err) => console.error("hydrateCart", err));
}

export function addToCart(slug: string, qty = 1, notify = true) {
  putCart({ op: "add", slug, qty });
  if (notify) {
    const product = getCatalogProduct(slug);
    toast(
      "Added to cart",
      product ? `${product.name} × ${qty}` : undefined,
      product ? productImage(product.slug) : undefined
    );
  }
}

export function removeFromCart(slug: string) {
  putCart({ op: "remove", slug });
}

export function setCartQty(slug: string, qty: number) {
  if (qty <= 0) {
    removeFromCart(slug);
    return;
  }
  putCart({ op: "set", slug, qty });
}

export function clearCart() {
  putCart({ op: "clear" });
}

function putCart(body: Record<string, unknown>) {
  fetch("/api/cart", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
    .then((r) => r.json())
    .then(({ lines }: { lines: DetailedLine[] }) => cartStore.set(lines ?? []))
    .catch((err) => console.error("cart", err));
}

export function cartCount(lines: { qty?: number }[]) {
  return lines.reduce((n, l) => n + (l.qty ?? 0), 0);
}

/** Kept for compatibility: cart lines from the API arrive pre-detailed. */
export function detailedCart(lines: DetailedLine[]): DetailedLine[] {
  return lines;
}

export function cartTotals(items: DetailedLine[]) {
  const subtotal = items.reduce((n, i) => n + i.product.price * i.line.qty, 0);
  const shipping = subtotal === 0 ? 0 : subtotal >= 150 ? 0 : 12;
  return { subtotal, shipping, total: subtotal + shipping };
}

/* ---------------- wishlist ---------------- */

export const wishlistStore = createStore<WishlistLine[]>([]);
export const savedStore = createStore<WishlistItem[]>([]);

export function hydrateWishlist() {
  fetch("/api/wishlist", { cache: "no-store" })
    .then((r) => r.json())
    .then(({ lines, items }: { lines: WishlistLine[]; items: WishlistItem[] }) => {
      wishlistStore.set(lines ?? []);
      savedStore.set(items ?? []);
    })
    .catch((err) => console.error("hydrateWishlist", err));
}

export function toggleWishlist(slug: string) {
  const exists = wishlistStore.get().some((l) => l.slug === slug);
  fetch("/api/wishlist", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ op: "toggle", slug }),
  })
    .then((r) => r.json())
    .then(({ lines, items }: { lines: WishlistLine[]; items: WishlistItem[] }) => {
      wishlistStore.set(lines ?? []);
      savedStore.set(items ?? []);
    })
    .catch((err) => console.error("wishlist", err));

  const product = getCatalogProduct(slug);
  toast(
    exists ? "Removed from saved" : "Saved for later",
    product?.name,
    product ? productImage(product.slug) : undefined
  );
}

export function isWishlisted(slug: string) {
  return wishlistStore.get().some((l) => l.slug === slug);
}

/* ---------------- toasts ---------------- */

export const toastStore = createStore<Toast[]>([]);
let toastId = 0;

export function toast(title: string, description?: string, image?: string) {
  const id = ++toastId;
  toastStore.set((prev) => [...prev.slice(-2), { id, title, description, image }]);
  setTimeout(() => {
    toastStore.set((prev) => prev.filter((t) => t.id !== id));
  }, 3200);
}

/* ---------------- orders ---------------- */

export const ordersStore = createStore<PlacedOrder[]>([]);

export function hydrateOrders() {
  fetch("/api/orders", { cache: "no-store" })
    .then((r) => r.json())
    .then(({ orders }: { orders: PlacedOrder[] }) => ordersStore.set(orders ?? []))
    .catch((err) => console.error("hydrateOrders", err));
}

export function placeOrder(input: {
  address: PlacedOrder["address"];
  payment: string;
}): Promise<PlacedOrder | null> {
  return fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
    .then((r) => r.json())
    .then(({ order, error }: { order?: PlacedOrder; error?: string }) => {
      if (error || !order) {
        toast("Order failed", error ?? "Please try again");
        return null;
      }
      ordersStore.set((prev) => [order, ...prev]);
      cartStore.set([]);
      return order;
    })
    .catch((err) => {
      console.error("placeOrder", err);
      toast("Order failed", "Network error, please try again");
      return null;
    });
}

export function latestOrder(): PlacedOrder | null {
  return ordersStore.get()[0] ?? null;
}

/* ---------------- auth (MongoDB-backed) ---------------- */

export const userStore = createStore<SafeUser | null>(null);

export function hydrateUser() {
  fetch("/api/auth/me", { cache: "no-store" })
    .then((r) => r.json())
    .then(({ user }: { user: SafeUser | null }) => userStore.set(user))
    .catch((err) => console.error("hydrateUser", err));
}

export function signInAs(role: "customer" | "vendor" | "admin") {
  // Kept for demo shortcuts; no longer creates a DB session by itself.
  userStore.set(() => ({ id: "demo", email: "", name: "", role }));
}

export async function signOut() {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    /* ignore */
  }
  userStore.set(() => null);
  toast("Signed out");
}

/* ---------------- one-shot hydration ---------------- */

export function useHydrateShops() {
  useEffect(() => {
    loadCatalog();
    hydrateCart();
    hydrateWishlist();
    hydrateOrders();
    hydrateUser();
  }, []);
}

export { useStore };
