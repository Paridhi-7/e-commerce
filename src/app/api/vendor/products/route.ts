import {
  createProductForVendor,
  deleteProductForVendor,
  updateProductForVendor,
} from "@/lib/db";
import { getAuthUser, unauthorized } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== "vendor" || !user.vendorId) return unauthorized();
  const body = (await request.json().catch(() => null)) as
    | {
        name?: string;
        category?: string;
        price?: number;
        stock?: number;
        badge?: string;
        description?: string;
      }
    | null;
  if (!body?.name || !body.category || !body.price) {
    return Response.json({ error: "Name, category and price are required" }, { status: 400 });
  }
  const product = await createProductForVendor(user.vendorId, {
    name: body.name,
    category: body.category,
    price: Number(body.price),
    stock: Number(body.stock ?? 0),
    badge: body.badge as never,
    description: body.description ?? "",
  });
  return Response.json({ product }, { status: 201 });
}

export async function PATCH(request: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== "vendor" || !user.vendorId) return unauthorized();
  const body = (await request.json().catch(() => null)) as
    | {
        slug?: string;
        name?: string;
        category?: string;
        price?: number;
        stock?: number;
        badge?: string;
        description?: string;
      }
    | null;
  if (!body?.slug) return Response.json({ error: "slug required" }, { status: 400 });
  const product = await updateProductForVendor(user.vendorId, body.slug, {
    name: body.name,
    category: body.category,
    price: Number.isFinite(Number(body.price)) ? Number(body.price) : undefined,
    stock: Number.isFinite(Number(body.stock)) ? Number(body.stock) : undefined,
    badge: (body.badge || undefined) as never,
    description: body.description,
  });
  if (!product) return Response.json({ error: "Product not found" }, { status: 404 });
  return Response.json({ product });
}

export async function DELETE(request: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== "vendor" || !user.vendorId) return unauthorized();
  const body = (await request.json().catch(() => null)) as { slug?: string } | null;
  if (!body?.slug) return Response.json({ error: "slug required" }, { status: 400 });
  const ok = await deleteProductForVendor(user.vendorId, body.slug);
  if (!ok) return Response.json({ error: "Product not found" }, { status: 404 });
  return Response.json({ ok: true });
}
