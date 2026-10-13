import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getVendorBySlug, listProducts } from "@/lib/db";
import { VendorStorefront } from "./storefront-client";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const vendor = await getVendorBySlug(slug);
  return {
    title: vendor ? `${vendor.name} — storefront` : "Vendor",
    description: vendor?.tagline,
  };
}

export default async function VendorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vendor = await getVendorBySlug(slug);
  if (!vendor) notFound();

  const products = await listProducts({ vendorId: vendor.id });

  return <VendorStorefront vendor={vendor} products={products} />;
}
