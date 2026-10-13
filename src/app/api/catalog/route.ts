import { listProducts, listVendors } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const [products, vendors] = await Promise.all([listProducts(), listVendors()]);
  return Response.json({ products, vendors });
}
