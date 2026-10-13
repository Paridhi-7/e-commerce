import { listProducts, listVendors } from "@/lib/db";
import { MarketplaceClient } from "./marketplace-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Marketplace",
  description: "Browse products across every independent vendor on KARTIFY.",
};

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const first = (k: string) => {
    const v = params[k];
    return typeof v === "string" ? v : Array.isArray(v) ? v[0] : undefined;
  };
  const [products, vendors] = await Promise.all([listProducts(), listVendors()]);

  return (
    <MarketplaceClient
      initialCategory={first("category")}
      initialVendor={first("vendor")}
      initialQuery={first("q")}
      initialSort={first("sort")}
      products={products}
      vendors={vendors}
    />
  );
}
