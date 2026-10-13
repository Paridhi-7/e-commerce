export type Role = "customer" | "vendor" | "admin";

export type VendorStatus = "approved" | "pending" | "suspended";

export interface Vendor {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  logo: string;
  banner: string;
  location: string;
  memberSince: string;
  rating: number;
  products: number;
  followers: string;
  status: VendorStatus;
  joined: string;
  revenue: number;
  accent: string;
}

export interface Review {
  id: string;
  productSlug: string;
  author: string;
  avatarSeed: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  helpful: number;
  verified: boolean;
}

export interface Product {
  slug: string;
  name: string;
  vendorId: string;
  category: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  stock: number;
  img: string;
  alt1?: string;
  alt2?: string;
  badge?: "Bestseller" | "New" | "Limited" | "Sale";
  description: string;
  features: string[];
  details: Record<string, string>;
  tags: string[];
  createdAt: number;
}

export interface CartLine {
  slug: string;
  qty: number;
  addedAt: number;
}

export interface WishlistLine {
  slug: string;
  addedAt: number;
}

export interface PlacedOrder {
  id: string;
  placedAt: number;
  lines: { slug: string; qty: number; price: number; vendorId: string }[];
  total: number;
  address: {
    name: string;
    street: string;
    city: string;
    zip: string;
    phone: string;
  };
  payment: string;
  eta: number;
}

export interface Toast {
  id: number;
  title: string;
  description?: string;
  image?: string;
}

export interface DetailedLine {
  line: CartLine;
  product: Product;
  vendorName: string;
  vendorSlug: string;
}

export interface WishlistItem {
  line: WishlistLine;
  product: Product;
}

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  role: "customer" | "vendor" | "admin";
  vendorId?: string;
}
