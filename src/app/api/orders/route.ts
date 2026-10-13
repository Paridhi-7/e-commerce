import {
  createOrder,
  getJoinedCart,
  listOrdersForUser,
  setCart,
  updateProductStock,
} from "@/lib/db";
import { getOwnerId } from "@/lib/session";
import type { PlacedOrder } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const ownerId = await getOwnerId();
  const orders = await listOrdersForUser(ownerId);
  return Response.json({ orders });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | {
        address?: PlacedOrder["address"];
        payment?: string;
      }
    | null;

  const address = body?.address;
  if (
    !address ||
    !address.name ||
    !address.street ||
    !address.city ||
    !address.zip ||
    !address.phone ||
    !body?.payment
  ) {
    return Response.json({ error: "Missing address or payment details" }, { status: 400 });
  }

  const ownerId = await getOwnerId();
  const cart = await getJoinedCart(ownerId);
  if (cart.length === 0) {
    return Response.json({ error: "Your cart is empty" }, { status: 400 });
  }

  // Server-authoritative pricing.
  const lines = cart.map((entry) => ({
    slug: entry.line.slug,
    qty: entry.line.qty,
    price: entry.product.price,
    vendorId: entry.product.vendorId,
  }));
  const subtotal = lines.reduce((n, l) => n + l.price * l.qty, 0);
  const shipping = subtotal >= 150 ? 0 : 12;
  const total = subtotal + shipping;

  // Decrement stock for purchased items.
  for (const l of lines) {
    const product = cart.find((c) => c.line.slug === l.slug)?.product;
    if (product) {
      await updateProductStock(l.slug, Math.max(0, product.stock - l.qty));
    }
  }

  const order = await createOrder({
    userId: ownerId,
    placedAt: Date.now(),
    lines,
    total,
    address,
    payment: body.payment,
    eta: Date.now() + 4 * 86400000,
  });

  await setCart(ownerId, []);

  const { id, ...rest } = order;
  const placed: PlacedOrder = { ...rest, id };
  return Response.json({ order: placed }, { status: 201 });
}
