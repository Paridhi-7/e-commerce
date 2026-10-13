import { MongoClient } from "mongodb";
import { randomBytes, scryptSync } from "crypto";
import { PRODUCTS } from "../src/lib/products";
import { VENDORS } from "../src/lib/vendors";
import { REVIEWS } from "../src/lib/reviews";
import { SALES_12M, CHANNEL_SPLIT, VENDOR_ORDERS } from "../src/lib/vendor-orders";

import fs from "fs";
import path from "path";

function loadEnvFile(file: string) {
  const filePath = path.resolve(process.cwd(), file);
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI missing — ensure it is set in .env.local or environment");
  process.exit(1);
}
const dbName = process.env.MONGODB_DB || "kartify";

async function main() {
  const client = new MongoClient(uri!);
  await client.connect();
  const db = client.db(dbName);
  console.log(`Connected to MongoDB · database "${dbName}"`);

  // Catalog
  const vendors = db.collection("vendors");
  for (const v of VENDORS) {
    await vendors.replaceOne({ id: v.id }, v, { upsert: true });
  }
  console.log(`✔ vendors: ${VENDORS.length}`);

  const products = db.collection("products");
  for (const p of PRODUCTS) {
    await products.replaceOne({ slug: p.slug }, p, { upsert: true });
  }
  console.log(`✔ products: ${PRODUCTS.length}`);

  const reviews = db.collection("reviews");
  for (const r of REVIEWS) {
    await reviews.replaceOne({ id: r.id }, r, { upsert: true });
  }
  console.log(`✔ reviews: ${REVIEWS.length}`);

  // Demo vendor-side orders (all belong to the northsupply storefront).
  const vendorOrders = db.collection("vendor_orders");
  for (const o of VENDOR_ORDERS) {
    await vendorOrders.replaceOne(
      { _id: o.id } as never,
      { ...o, _id: o.id, vendorId: "northsupply" } as never,
      { upsert: true }
    );
  }
  console.log(`✔ vendor orders: ${VENDOR_ORDERS.length}`);

  const stats = db.collection("vendor_stats");
  for (const v of VENDORS) {
    await stats.replaceOne(
      { _id: v.id } as never,
      { _id: v.id, sales12m: SALES_12M, channelSplit: CHANNEL_SPLIT } as never,
      { upsert: true }
    );
  }
  console.log(`✔ vendor stats: ${VENDORS.length}`);

  // Demo accounts
  const users = db.collection("users");
  async function upsertUser(
    email: string,
    name: string,
    password: string,
    role: string,
    vendorId?: string
  ) {
    if (await users.findOne({ email })) {
      console.log(`· user exists: ${email}`);
      return;
    }
    const salt = randomBytes(16).toString("hex");
    const passwordHash = scryptSync(password, salt, 64).toString("hex");
    await users.insertOne({
      _id: randomBytes(12).toString("hex"),
      email,
      name,
      passwordHash,
      salt,
      role,
      ...(vendorId ? { vendorId } : {}),
      createdAt: Date.now(),
    } as never);
    console.log(`✔ user: ${email} (role: ${role}, password: ${password})`);
  }

  await upsertUser("admin@kartify.shop", "Kartify Admin", "admin123", "admin");
  await upsertUser("vendor@kartify.shop", "North Supply Co.", "vendor123", "vendor", "northsupply");
  await upsertUser("demo@kartify.shop", "Demo Customer", "demo123", "customer");

  await client.close();
  console.log("Seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
