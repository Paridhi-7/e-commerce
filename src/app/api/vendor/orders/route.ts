import { getAuthUser, unauthorized } from "@/lib/session";
import { listVendorOrders, setVendorOrderStatus, listProducts } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getAuthUser();
  if (!user || user.role !== "vendor" || !user.vendorId) return unauthorized();
  const orders = await listVendorOrders(user.vendorId);
  const products = await listProducts({ vendorId: user.vendorId });
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  return Response.json({
    orders: orders.map((o) => ({
      ...o,
      items: o.items.map((item) => ({
        ...item,
        name: bySlug.get(item.slug)?.name ?? item.slug,
        price: bySlug.get(item.slug)?.price ?? 0,
      })),
    })),
  });
}

export async function PATCH(request: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== "vendor" || !user.vendorId) return unauthorized();
  const body = (await request.json().catch(() => null)) as
    | { id?: string; status?: "new" | "packing" | "shipped" | "delivered" }
    | null;
  if (!body?.id || !body.status) {
    return Response.json({ error: "id and status required" }, { status: 400 });
  }
  const own = await listVendorOrders(user.vendorId);
  if (!own.some((o) => o.id === body.id)) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }
  await setVendorOrderStatus(body.id, body.status);
  return Response.json({ ok: true });
}
