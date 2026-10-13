import { getJoinedWishlist, setWishlist } from "@/lib/db";
import { getOwnerId } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const ownerId = await getOwnerId();
  const joined = await getJoinedWishlist(ownerId);
  return Response.json({ lines: joined.map((e) => e.line), items: joined });
}

export async function PUT(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { op: "toggle"; slug?: string }
    | null;
  if (!body || (body.op !== "toggle" && !("lines" in body))) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const ownerId = await getOwnerId();
  const before = (await getJoinedWishlist(ownerId)).map((entry) => entry.line);

  let lines = [...before];
  if (body.op === "toggle" && body.slug) {
    lines = lines.some((l) => l.slug === body.slug)
      ? lines.filter((l) => l.slug !== body.slug)
      : [...lines, { slug: body.slug, addedAt: Date.now() }];
  }

  await setWishlist(ownerId, lines);
  const joined = await getJoinedWishlist(ownerId);
  return Response.json({
    lines: joined.map((entry) => entry.line),
    items: joined,
  });
}
