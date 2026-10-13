import {
  getVendorById,
  getVendorStats,
  listProducts,
  listVendorOrders,
} from "@/lib/db";
import { getAuthUser, unauthorized } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorized();
  if (user.role !== "vendor" || !user.vendorId) {
    return Response.json({ error: "Vendor account required" }, { status: 403 });
  }

  const vendor = await getVendorById(user.vendorId);
  const [products, orders, stats] = await Promise.all([
    listProducts({ vendorId: user.vendorId }),
    listVendorOrders(user.vendorId),
    getVendorStats(user.vendorId),
  ]);

  // Join order items with product names/prices for the dashboard.
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const joinedOrders = orders.map((o) => ({
    ...o,
    items: o.items.map((item) => {
      const p = bySlug.get(item.slug);
      return {
        ...item,
        name: p?.name ?? item.slug,
        price: p?.price ?? 0,
      };
    }),
  }));

  const lowStock = products
    .filter((p) => p.stock <= 12)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5)
    .map((p) => ({ slug: p.slug, name: p.name, stock: p.stock, price: p.price }));

  const revenueMonth = stats?.sales12m.at(-1)?.value ?? 0;

  return Response.json({
    vendor,
    products,
    orders: joinedOrders,
    stats: stats ?? { sales12m: [], channelSplit: [] },
    lowStock,
    revenueMonth,
  });
}
