import { addReview, listProducts, reviewsFor } from "@/lib/db";
import { MONTHS } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("productSlug");
  if (!slug) return Response.json({ error: "productSlug required" }, { status: 400 });
  return Response.json({ reviews: await reviewsFor(slug) });
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const input = (payload ?? {}) as {
    productSlug?: string;
    author?: string;
    rating?: number;
    title?: string;
    body?: string;
  };
  const { productSlug, author, rating, title, body } = input;
  if (!productSlug || !author || !title || !body) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }
  const stars = Math.min(5, Math.max(1, Math.round(Number(rating) || 0)));
  const products = await listProducts();
  if (!products.some((p) => p.slug === productSlug)) {
    return Response.json({ error: "Unknown product" }, { status: 404 });
  }
  const avatarSeed = String(author)
    .split(/\s+/)
    .map((w: string) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const d = new Date();
  const review = await addReview({
    productSlug,
    author: String(author).trim(),
    avatarSeed,
    rating: stars,
    date: `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`,
    title: String(title).trim(),
    body: String(body).trim(),
    helpful: 0,
    verified: false,
  });
  return Response.json({ review }, { status: 201 });
}
