import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getVendorById, listProducts, reviewsFor } from "@/lib/db";
import { ProductDetailClient } from "./product-detail-client";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return {
    title: product ? product.name : "Product",
    description: product?.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [vendor, related, initialReviews] = await Promise.all([
    getVendorById(product.vendorId),
    listProducts(),
    reviewsFor(product.slug),
  ]);

  const relatedProducts = related
    .filter(
      (p) =>
        p.slug !== product.slug &&
        (p.category === product.category || p.vendorId === product.vendorId)
    )
    .slice(0, 4);

  return (
    <ProductDetailClient
      product={product}
      vendor={vendor ?? null}
      related={relatedProducts}
      initialReviews={initialReviews}
    />
  );
}
