import { Hero } from "@/components/home/hero";
import {
  CategoryGrid,
  FeaturedVendors,
  HowItWorks,
  SellCTA,
  Testimonials,
  TrendingSection,
  ValuesRow,
} from "@/components/home/home-sections";
import { listProducts, listVendors, reviewsFor } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [products, vendors] = await Promise.all([listProducts(), listVendors()]);
  const [tote, headphones, wallet] = await Promise.all([
    reviewsFor("nord-city-tote"),
    reviewsFor("lumen-studio-one"),
    reviewsFor("velvet-bifold-wallet"),
  ]);
  const testimonials = [
    ...tote.filter((r) => r.author.startsWith("Amelia")),
    ...headphones.filter((r) => r.author.startsWith("Alex")),
    ...wallet.filter((r) => r.author.startsWith("Marcus")),
  ].slice(0, 3);

  return (
    <>
      <Hero />
      <HowItWorks />
      <CategoryGrid />
      <TrendingSection products={products} />
      <FeaturedVendors vendors={vendors} />
      <ValuesRow />
      <Testimonials reviews={testimonials} products={products} vendors={vendors} />
      <SellCTA />
    </>
  );
}
