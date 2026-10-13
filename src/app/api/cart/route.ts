import { getCart, getJoinedCart, getProductBySlug, setCart } from "@/lib/db";
import { getOwnerId } from "@/lib/session";
import type { CartLine } from "@/lib/types";

export const dynamic = "force-dynamic";

type CartOp = {
  op: "add" | "set" | "remove" | "clear";
  slug?: string;
  qty?: number;
};

export async function GET() {
  const ownerId = await getOwnerId();
  const lines = await getJoinedCart(ownerId);
  return Response.json({ lines });
}

export async function PUT(request: Request) {
  const body = (await request.json().catch(() => null)) as CartOp | null;
  if (!body?.op) return Response.json({ error: "op required" }, { status: 400 });

  const ownerId = await getOwnerId();
  const before: CartLine[] = await getCart(ownerId);
  let lines = [...before];

  if (body.op === "clear") {
    lines = [];
  } else if (body.op === "remove" && body.slug) {
    lines = lines.filter((l) => l.slug !== body.slug);
  } else if (body.slug) {
    const product = await getProductBySlug(body.slug);
    if (!product) return Response.json({ error: "Unknown product" }, { status: 404 });
    const max = product.stock;
    const now = Date.now();
    const found = lines.find((l) => l.slug === body.slug);

    if (body.op === "add") {
      const qty = Math.min((found?.qty ?? 0) + Math.max(1, Math.round(body.qty ?? 1)), max);
      lines = found
        ? lines.map((l) => (l.slug === body.slug ? { ...l, qty } : l))
        : [...lines, { slug: body.slug, qty, addedAt: now }];
    } else if (body.op === "set") {
      const qty = Math.min(Math.max(1, Math.round(body.qty ?? found?.qty ?? 1)), max);
      lines = lines.map((l) => (l.slug === body.slug ? { ...l, qty } : l));
    }
  }

  await setCart(ownerId, lines);
  const joined = await getJoinedCart(ownerId);
  return Response.json({ lines: joined });
}
