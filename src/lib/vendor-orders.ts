import { PRODUCTS } from "./products";
import { money } from "./format";

export interface VendorOrder {
  id: string;
  customer: string;
  date: string;
  items: { slug: string; qty: number }[];
  total: number;
  status: "new" | "packing" | "shipped" | "delivered";
}

export const VENDOR_ORDERS: VendorOrder[] = [
  { id: "KT-8F3K2M", customer: "Amelia Chen", date: "Sep 24, 2026", items: [{ slug: "nord-city-tote", qty: 1 }], total: 148, status: "new" },
  { id: "KT-8F2X9Q", customer: "Marcus Bell", date: "Sep 24, 2026", items: [{ slug: "nord-field-pack", qty: 1 }, { slug: "nord-passport-holder", qty: 2 }], total: 326, status: "new" },
  { id: "KT-8E9D4L", customer: "Hannah Lee", date: "Sep 23, 2026", items: [{ slug: "nord-weekender", qty: 1 }], total: 245, status: "packing" },
  { id: "KT-8E7B1N", customer: "Tom Becker", date: "Sep 22, 2026", items: [{ slug: "nord-horizon-watch", qty: 1 }], total: 315, status: "shipped" },
  { id: "KT-8E5A7P", customer: "Sofia Marino", date: "Sep 21, 2026", items: [{ slug: "nord-camera-sling", qty: 1 }, { slug: "nord-city-tote", qty: 1 }], total: 277, status: "shipped" },
  { id: "KT-8D9K3R", customer: "Daniel Osei", date: "Sep 19, 2026", items: [{ slug: "nord-field-pack", qty: 1 }], total: 198, status: "delivered" },
  { id: "KT-8D6M8T", customer: "Priya Natarajan", date: "Sep 18, 2026", items: [{ slug: "nord-city-tote", qty: 2 }], total: 296, status: "delivered" },
  { id: "KT-8D2P5V", customer: "James Whitfield", date: "Sep 16, 2026", items: [{ slug: "nord-horizon-watch", qty: 1 }, { slug: "nord-passport-holder", qty: 1 }], total: 379, status: "delivered" },
];

export const SALES_12M = [
  { label: "Oct", value: 8200 },
  { label: "Nov", value: 12400 },
  { label: "Dec", value: 16800 },
  { label: "Jan", value: 9400 },
  { label: "Feb", value: 8900 },
  { label: "Mar", value: 11200 },
  { label: "Apr", value: 10400 },
  { label: "May", value: 13100 },
  { label: "Jun", value: 14600 },
  { label: "Jul", value: 13800 },
  { label: "Aug", value: 15900 },
  { label: "Sep", value: 18300 },
];

export const CHANNEL_SPLIT = [
  { label: "Marketplace", pct: 62 },
  { label: "Direct", pct: 24 },
  { label: "Repeat", pct: 14 },
];

export function vendorRevenueMonth() {
  return SALES_12M[SALES_12M.length - 1].value;
}

export function lowStock(threshold = 12) {
  return PRODUCTS.filter((p) => p.stock <= threshold)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5)
    .map((p) => ({ slug: p.slug, name: p.name, stock: p.stock, price: money(p.price) }));
}
