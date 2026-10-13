import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "crypto";
import { promisify } from "util";
import type { Collection, Document } from "mongodb";
import { getDb } from "./mongodb";
import type { Product, Review, Vendor, VendorStatus, SafeUser } from "./types";
import { PRODUCTS } from "./products";
import { VENDORS } from "./vendors";
import { REVIEWS } from "./reviews";
import { SALES_12M, CHANNEL_SPLIT, VENDOR_ORDERS } from "./vendor-orders";

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: string,
  keylen: number
) => Promise<Buffer>;

/* ---------------- collection helpers ---------------- */

interface UserDoc {
  _id: string;
  email: string;
  name: string;
  passwordHash: string;
  salt: string;
  role: "customer" | "vendor" | "admin";
  vendorId?: string;
  createdAt: number;
}

interface SessionDoc {
  _id: string; // token
  userId: string;
  createdAt: number;
}

interface CartDoc {
  _id: string; // userId
  lines: { slug: string; qty: number; addedAt: number }[];
}

interface WishlistDoc {
  _id: string; // userId
  lines: { slug: string; addedAt: number }[];
}

interface OrderDoc {
  _id: string;
  userId: string;
  placedAt: number;
  lines: { slug: string; qty: number; price: number; vendorId: string }[];
  total: number;
  address: { name: string; street: string; city: string; zip: string; phone: string };
  payment: string;
  eta: number;
}

export interface VendorOrderDoc {
  _id: string;
  id: string;
  vendorId: string;
  customer: string;
  date: string;
  items: { slug: string; qty: number }[];
  total: number;
  status: "new" | "packing" | "shipped" | "delivered";
}

export interface VendorStatsDoc {
  _id: string; // vendorId
  sales12m: { label: string; value: number }[];
  channelSplit: { label: string; pct: number }[];
}

const cleanup = {
  users: <T extends { _id?: unknown }>(d: T) => {
    const { _id, ...rest } = d;
    return { id: String(_id), ...rest };
  },
};

function col<T>(name: string) {
  return getDb().then(
    (db) => db.collection(name) as unknown as Collection<T & Document>
  );
};

let seedDone = false;
let seedPromise: Promise<void> | null = null;

export async function ensureSeeded(): Promise<void> {
  if (seedDone) return;
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    try {
      const db = await getDb();
      const products = db.collection("products");
      const count = await products.countDocuments();
      if (count > 0) {
        seedDone = true;
        return;
      }

      const vendors = db.collection("vendors");
      for (const v of VENDORS) {
        await vendors.replaceOne({ id: v.id } as never, v as never, { upsert: true });
      }

      for (const p of PRODUCTS) {
        await products.replaceOne({ slug: p.slug } as never, p as never, { upsert: true });
      }

      const reviews = db.collection("reviews");
      for (const r of REVIEWS) {
        await reviews.replaceOne({ id: r.id } as never, r as never, { upsert: true });
      }

      const vendorOrders = db.collection("vendor_orders");
      for (const o of VENDOR_ORDERS) {
        await vendorOrders.replaceOne(
          { _id: o.id } as never,
          { ...o, _id: o.id, vendorId: "northsupply" } as never,
          { upsert: true }
        );
      }

      const stats = db.collection("vendor_stats");
      for (const v of VENDORS) {
        await stats.replaceOne(
          { _id: v.id } as never,
          { _id: v.id, sales12m: SALES_12M, channelSplit: CHANNEL_SPLIT } as never,
          { upsert: true }
        );
      }

      const users = db.collection("users");
      const demoAccounts = [
        { email: "admin@kartify.shop", name: "Kartify Admin", pass: "admin123", role: "admin" as const },
        { email: "vendor@kartify.shop", name: "North Supply Co.", pass: "vendor123", role: "vendor" as const, vendorId: "northsupply" },
        { email: "demo@kartify.shop", name: "Demo Customer", pass: "demo123", role: "customer" as const },
      ];

      for (const acc of demoAccounts) {
        if (!(await users.findOne({ email: acc.email }))) {
          const { salt, hash } = await hashPassword(acc.pass);
          await users.insertOne({
            _id: randomBytes(12).toString("hex"),
            email: acc.email,
            name: acc.name,
            passwordHash: hash,
            salt,
            role: acc.role,
            ...(acc.vendorId ? { vendorId: acc.vendorId } : {}),
            createdAt: Date.now(),
          } as never);
        }
      }
      seedDone = true;
    } catch (err) {
      console.warn("MongoDB initial seed note:", err);
    }
  })();

  return seedPromise;
}

/* ---------------- auth ---------------- */

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scrypt(password, salt, 64)) as Buffer;
  return { salt, hash: buf.toString("hex") };
}

export async function verifyPassword(password: string, salt: string, hash: string) {
  const buf = (await scrypt(password, salt, 64)) as Buffer;
  return timingSafeEqual(Buffer.from(hash, "hex"), buf);
}

export async function createUser(input: {
  email: string;
  name: string;
  password: string;
  role: UserDoc["role"];
  vendorId?: string;
}) {
  const users = await col<UserDoc>("users");
  const email = input.email.trim().toLowerCase();
  const existing = await users.findOne({ email: email });
  if (existing) return null;
  const { salt, hash } = await hashPassword(input.password);
  const doc: UserDoc = {
    _id: randomBytes(12).toString("hex"),
    email,
    name: input.name.trim(),
    passwordHash: hash,
    salt,
    role: input.role,
    ...(input.vendorId ? { vendorId: input.vendorId } : {}),
    createdAt: Date.now(),
  };
  await users.insertOne(doc);
  return cleanup.users(doc);
}

export async function findUserByEmail(email: string) {
  const users = await col<UserDoc>("users");
  const doc = await users.findOne({ email: email.trim().toLowerCase() });
  return doc ? (cleanup.users(doc) as Omit<UserDoc, "_id"> & { id: string }) : null;
}

export async function findUserById(id: string) {
  const users = await col<UserDoc>("users");
  const doc = await users.findOne({ _id: id });
  return doc ? (cleanup.users(doc) as Omit<UserDoc, "_id"> & { id: string }) : null;
}

export async function createSession(userId: string) {
  const sessions = await col<SessionDoc>("sessions");
  const token = randomBytes(24).toString("hex");
  await sessions.insertOne({ _id: token, userId, createdAt: Date.now() });
  return token;
}

export async function deleteSession(token: string) {
  const sessions = await col<SessionDoc>("sessions");
  await sessions.deleteOne({ _id: token });
}

/** Resolve a user from a session token (route handlers / server components). */
export async function getUserFromSessionToken(token: string | null | undefined) {
  if (!token) return null;
  const sessions = await col<SessionDoc>("sessions");
  const session = await sessions.findOne({ _id: token });
  if (!session) return null;
  return findUserById(session.userId);
}

export type { SafeUser };

export function toSafeUser(user: SafeUser): SafeUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    ...(user.vendorId ? { vendorId: user.vendorId } : {}),
  };
}

/* ---------------- products ---------------- */

export async function listProducts(filter: {
  category?: string;
  vendorId?: string;
  q?: string;
} = {}): Promise<Product[]> {
  await ensureSeeded();
  const products = await col<Product>("products");
  const query: Record<string, unknown> = {};
  if (filter.category) query.category = filter.category;
  if (filter.vendorId) query.vendorId = filter.vendorId;
  if (filter.q) query.$text = { $search: filter.q };
  return products.find(query).toArray();
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await col<Product>("products");
  return products.findOne({ slug } as never);
}

export async function updateProductStock(slug: string, stock: number) {
  const products = await col<Product>("products");
  await products.updateOne({ slug } as never, { $set: { stock } });
}

export async function createProductForVendor(
  vendorId: string,
  input: {
    name: string;
    category: string;
    price: number;
    stock: number;
    badge?: Product["badge"];
    description: string;
  }
) {
  const products = await col<Product>("products");
  const base =
    input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "product";
  let slug = base;
  let n = 1;
  while (await products.findOne({ slug } as never)) slug = `${base}-${++n}`;
  const doc: Product = {
    slug,
    name: input.name.trim(),
    vendorId,
    category: input.category,
    price: input.price,
    rating: 0,
    reviews: 0,
    stock: Math.max(0, Math.round(input.stock)),
    img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80",
    badge: input.badge,
    description: input.description || "A new piece from this studio.",
    features: ["Added via vendor dashboard"],
    details: { Status: "Draft" },
    tags: ["new"],
    createdAt: Date.now(),
  };
  await products.insertOne(doc);
  return doc;
}

export async function updateProductForVendor(
  vendorId: string,
  slug: string,
  patch: Partial<Pick<Product, "name" | "category" | "price" | "stock" | "badge" | "description">>
) {
  const products = await col<Product>("products");
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(patch)) {
    if (v !== undefined) clean[k] = v;
  }
  if (Object.keys(clean).length === 0) return null;
  const res = await products.findOneAndUpdate(
    { slug, vendorId } as never,
    { $set: clean },
    { returnDocument: "after" }
  );
  return res ?? null;
}

export async function deleteProductForVendor(vendorId: string, slug: string) {
  const products = await col<Product>("products");
  const res = await products.deleteOne({ slug, vendorId } as never);
  return res.deletedCount > 0;
}

/* ---------------- vendors ---------------- */

export async function listVendors(): Promise<Vendor[]> {
  await ensureSeeded();
  const vendors = await col<Vendor>("vendors");
  return vendors.find().sort({ name: 1 }).toArray();
}

export async function getVendorBySlug(slug: string): Promise<Vendor | null> {
  const vendors = await col<Vendor>("vendors");
  return vendors.findOne({ slug } as never);
}

export async function getVendorById(id: string): Promise<Vendor | null> {
  const vendors = await col<Vendor>("vendors");
  return vendors.findOne({ id } as never);
}

export async function setVendorStatus(id: string, status: VendorStatus) {
  const vendors = await col<Vendor>("vendors");
  await vendors.updateOne({ id } as never, { $set: { status } });
}

/** Creates a pending vendor profile from the seller-application flow. */
export async function createPendingVendor(input: { name: string; tagline?: string }) {
  const vendors = await col<Vendor>("vendors");
  const timestamp = Date.now().toString(36);
  let slug =
    input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") ||
    `store-${timestamp}`;
  if (await vendors.findOne({ slug } as never)) slug = `${slug}-${timestamp}`;
  const doc: Vendor = {
    id: `v-${timestamp}`,
    slug,
    name: input.name.trim(),
    tagline: input.tagline?.trim() || "New on KARTIFY",
    description: "This storefront is awaiting review by the KARTIFY curation team.",
    logo: "",
    banner: "",
    location: "",
    memberSince: new Date().getFullYear().toString(),
    rating: 0,
    products: 0,
    followers: "0",
    status: "pending",
    joined: "Just now",
    revenue: 0,
    accent: "#52525b",
  };
  await vendors.insertOne(doc);
  return doc;
}

/* ---------------- reviews ---------------- */

export async function reviewsFor(productSlug: string): Promise<Review[]> {
  const reviews = await col<Review>("reviews");
  return reviews.find({ productSlug }).sort({ date: 1 }).toArray();
}

export async function addReview(input: Omit<Review, "id"> & { id?: string }) {
  const reviews = await col<Review>("reviews");
  const doc: Review = { ...input, id: input.id ?? randomBytes(8).toString("hex") };
  await reviews.insertOne(doc);
  // keep the product's aggregate rating roughly in sync
  const products = await col<Product>("products");
  const product = await products.findOne({ slug: input.productSlug } as never);
  if (product) {
    const count = product.reviews + 1;
    const rating =
      Math.round(((product.rating * product.reviews + input.rating) / count) * 10) / 10;
    await products.updateOne(
      { slug: input.productSlug } as never,
      { $set: { rating, reviews: count } }
    );
  }
  return doc;
}

/* ---------------- cart + wishlist (per user) ---------------- */

export async function getCart(userId: string) {
  const carts = await col<CartDoc>("carts");
  const doc = await carts.findOne({ _id: userId } as never);
  return doc?.lines ?? [];
}

/** Cart lines joined with their product + vendor for display. */
export async function getJoinedCart(ownerId: string) {
  const lines = await getCart(ownerId);
  if (lines.length === 0) return [];
  const products = await col<Product>("products");
  const vendors = await col<Vendor>("vendors");
  const productDocs = await products
    .find({ slug: { $in: lines.map((l) => l.slug) } } as never)
    .toArray();
  const vendorDocs = await vendors.find().toArray();
  const pMap = new Map(productDocs.map((p): [string, Product] => [p.slug, p]));
  const vMap = new Map(vendorDocs.map((v): [string, Vendor] => [v.id, v]));
  return lines
    .filter((l) => pMap.has(l.slug))
    .map((l) => {
      const product = pMap.get(l.slug)!;
      const vendor = vMap.get(product.vendorId);
      return {
        line: l,
        product,
        vendorName: vendor?.name ?? "Independent",
        vendorSlug: vendor?.slug ?? "#",
      };
    });
}

export async function setCart(userId: string, lines: CartDoc["lines"]) {
  const carts = await col<CartDoc>("carts");
  await carts.replaceOne(
    { _id: userId } as never,
    { _id: userId, lines } as unknown as CartDoc,
    { upsert: true }
  );
}

export async function getWishlist(userId: string) {
  const wishlists = await col<WishlistDoc>("wishlists");
  const doc = await wishlists.findOne({ _id: userId } as never);
  return doc?.lines ?? [];
}

export async function setWishlist(userId: string, lines: WishlistDoc["lines"]) {
  const wishlists = await col<WishlistDoc>("wishlists");
  await wishlists.replaceOne(
    { _id: userId } as never,
    { _id: userId, lines } as unknown as WishlistDoc,
    { upsert: true }
  );
}

/** Wishlist lines joined with their product for display. */
export async function getJoinedWishlist(ownerId: string) {
  const lines = await getWishlist(ownerId);
  if (lines.length === 0) return [];
  const products = await col<Product>("products");
  const productDocs = await products
    .find({ slug: { $in: lines.map((l) => l.slug) } } as never)
    .toArray();
  const pMap = new Map(productDocs.map((p): [string, Product] => [p.slug, p]));
  return lines
    .filter((l) => pMap.has(l.slug))
    .map((l) => ({ line: l, product: pMap.get(l.slug)! }));
}

/* ---------------- orders (checkout) ---------------- */

export async function createOrder(order: Omit<OrderDoc, "_id"> & { _id?: string }) {
  const orders = await col<OrderDoc>("orders");
  const doc: OrderDoc = { ...order, _id: order._id ?? `KT-${Date.now().toString(36).toUpperCase()}` };
  await orders.insertOne(doc);
  return { ...doc, id: doc._id };
}

export async function listOrdersForUser(userId: string) {
  const orders = await col<OrderDoc>("orders");
  const docs = await orders.find({ userId }).sort({ placedAt: -1 }).toArray();
  return docs.map((d) => ({ ...d, id: d._id }));
}

export async function getOrderById(id: string) {
  const orders = await col<OrderDoc>("orders");
  const doc = await orders.findOne({ _id: id });
  return doc ? { ...doc, id: doc._id } : null;
}

/* ---------------- vendor ops ---------------- */

export async function listVendorOrders(vendorId: string): Promise<VendorOrderDoc[]> {
  const orders = await col<VendorOrderDoc>("vendor_orders");
  const docs = await orders.find({ vendorId }).sort({ date: 1 }).toArray();
  return docs.map((d) => ({ ...d, id: d._id }));
}

export async function setVendorOrderStatus(id: string, status: VendorOrderDoc["status"]) {
  const orders = await col<VendorOrderDoc>("vendor_orders");
  await orders.updateOne({ _id: id }, { $set: { status } });
}

export async function getVendorStats(vendorId: string): Promise<VendorStatsDoc | null> {
  const stats = await col<VendorStatsDoc>("vendor_stats");
  const doc = await stats.findOne({ _id: vendorId } as never);
  return doc;
}

export { getDb } from "./mongodb";
