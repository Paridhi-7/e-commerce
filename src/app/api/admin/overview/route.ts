import { getDb, listVendors, listProducts, setVendorStatus } from "@/lib/db";
import { getAuthUser, unauthorized } from "@/lib/session";
import type { VendorStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getAuthUser();
  if (!user || user.role !== "admin") return unauthorized();

  const db = await getDb();
  const vendors = await listVendors();
  const products = await listProducts();
  const orderCount = await db.collection("orders").countDocuments();
  const usersCount = await db.collection("users").countDocuments();
  const revenueAgg = await db
    .collection("orders")
    .aggregate([{ $group: { _id: null, revenue: { $sum: "$total" } } }])
    .toArray();
  const revenue = revenueAgg[0]?.revenue ?? 0;

  return Response.json({
    vendors,
    products,
    productCount: products.length,
    orderCount,
    usersCount,
    revenue,
  });
}

export async function PATCH(request: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== "admin") return unauthorized();
  const body = (await request.json().catch(() => null)) as
    | { id?: string; status?: VendorStatus }
    | null;
  if (!body?.id || !body.status) {
    return Response.json({ error: "id and status required" }, { status: 400 });
  }
  await setVendorStatus(body.id, body.status);
  return Response.json({ ok: true });
}
