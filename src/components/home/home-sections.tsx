"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, Truck, Undo2 } from "lucide-react";
import { CATEGORIES, CATEGORY_IMAGES } from "@/lib/products";
import type { Product, Review, Vendor } from "@/lib/types";
import { SmartImage, Reveal } from "@/components/ui";
import { ProductCard } from "@/components/product-card";
import { VendorCard } from "@/components/vendor-card";
import { SectionHeader } from "@/components/section-header";
import { LinkButton } from "@/components/buttons";
import { Rating } from "@/components/ui";

export function CategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Browse"
        title="Shop by category"
        description="Six departments, hundreds of considered objects — every vendor is reviewed before joining."
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {CATEGORIES.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.06, ease: [0.21, 0.6, 0.35, 1] }}
          >
            <Link
              href={`/marketplace?category=${encodeURIComponent(c.name)}`}
              className="group block overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-accent-border hover:shadow-card-hover"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
                <SmartImage
                  src={CATEGORY_IMAGES[c.name]}
                  alt={c.name}
                  sizes="(max-width: 640px) 50vw, 200px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-between px-3.5 py-3">
                <div>
                  <p className="text-[13px] font-bold">{c.name}</p>
                  <p className="text-[11px] text-subtle">{c.blurb}</p>
                </div>
                <ArrowRight size={14} className="text-subtle transition-all group-hover:translate-x-0.5 group-hover:text-accent" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function TrendingSection({ products }: { products: Product[] }) {
  const trending = [...products]
    .sort((a, b) => b.reviews * b.rating - a.reviews * a.rating)
    .slice(0, 8);

  return (
    <section className="border-y border-line bg-surface/60 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Popular right now"
          title="Trending this week"
          description="Ranked by reviews across every storefront on the platform."
          href="/marketplace?sort=popular"
          linkLabel="View all"
        />
        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {trending.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} priority={i < 4} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturedVendors({ vendors }: { vendors: Vendor[] }) {
  const featured = vendors.filter((v) => v.status === "approved").slice(0, 6);
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Storefronts"
        title="Featured vendors"
        description="Independent studios with their own branding, catalog and story — each one a small shop."
        href="/vendors"
        linkLabel="All vendors"
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((v, i) => (
          <VendorCard key={v.id} vendor={v} index={i} />
        ))}
      </div>
    </section>
  );
}

export function ValuesRow() {
  const values = [
    { icon: Truck, title: "Free shipping over $150", body: "Consolidated from multiple vendors, tracked end to end." },
    { icon: Undo2, title: "30-day returns", body: "Changed your mind? Send it back, no interrogation." },
    { icon: ShieldCheck, title: "Buyer protection", body: "Every order is covered until it lands in your hands." },
    { icon: Sparkles, title: "Curated vendors", body: "Every storefront is reviewed before it opens." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {values.map((v, i) => (
          <Reveal key={v.title} delay={i * 0.06}>
            <div className="flex h-full flex-col gap-3 rounded-2xl border border-line bg-surface p-5 shadow-card">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <v.icon size={18} />
              </span>
              <p className="text-sm font-bold">{v.title}</p>
              <p className="text-[13px] leading-relaxed text-muted">{v.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Testimonials({
  reviews,
  products,
  vendors,
}: {
  reviews: Review[];
  products: Product[];
  vendors: Vendor[];
}) {
  const testimonials = reviews;

  const vendorFor = (slug: string) =>
    vendors.find((v) => products.find((p) => p.slug === slug)?.vendorId === v.id);

  return (
    <section className="border-y border-line bg-surface/60 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Reviews"
          title="What buyers say"
          description="Verified reviews from real orders across the marketplace."
        />
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => {
            const vendor = vendorFor(t.productSlug);
            return (
              <Reveal key={t.id} delay={i * 0.08}>
                <figure className="flex h-full flex-col gap-4 rounded-2xl border border-line bg-surface p-6 shadow-card">
                  <Rating value={t.rating} />
                  <blockquote className="flex-1 text-[15px] leading-relaxed text-foreground/85">
                    “{t.body}”
                  </blockquote>
                  <figcaption className="flex items-center gap-3 border-t border-line pt-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-[12px] font-bold text-accent">
                      {t.avatarSeed}
                    </span>
                    <div>
                      <p className="text-[13px] font-bold">{t.author}</p>
                      <p className="text-[12px] text-muted">on {t.title} · {vendor?.name}</p>
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    {
      n: "1",
      title: "Browse every store at once",
      body: "Products from all independent vendors live in one catalog — filter by category, price or maker.",
    },
    {
      n: "2",
      title: "Fill one cart, mix vendors",
      body: "Add from different storefronts freely. Your cart keeps everything grouped by seller automatically.",
    },
    {
      n: "3",
      title: "Check out once, we do the rest",
      body: "A single payment is split behind the scenes. Each vendor ships their part, all tracked in your account.",
    },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <Reveal className="mx-auto mb-10 max-w-2xl text-center">
        <p className="eyebrow text-accent">How KARTIFY works</p>
        <h2 className="h2 mt-2">Shop small, without the extra work</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          Buying from five independent stores used to mean five carts and five checkouts.
          Here, it&apos;s one.
        </p>
      </Reveal>
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((s, i) => (
          <Reveal key={s.n} delay={i * 0.08}>
            <div className="relative h-full rounded-2xl border border-line bg-surface p-6 shadow-card">
              <span className="tabular flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-sm font-extrabold text-accent">
                {s.n}
              </span>
              <h3 className="mt-4 text-base font-bold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function SellCTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-foreground px-6 py-14 text-center sm:px-12">
          <div
            aria-hidden
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(99,102,241,0.5), transparent 40%), radial-gradient(circle at 80% 60%, rgba(129,140,248,0.4), transparent 45%)",
            }}
          />
          <div className="relative">
            <p className="eyebrow text-indigo-300">For makers</p>
            <h2 className="display mx-auto mt-3 max-w-2xl text-[clamp(1.9rem,4vw,3rem)] text-white">
              Your storefront deserves better than a listing page.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-zinc-300">
              Get your own branded storefront, product dashboard, order management and
              analytics — live in minutes, reviewed by our team within 48 hours.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <LinkButton href="/signup?type=vendor" size="lg">
                Apply to sell
                <ArrowRight size={17} />
              </LinkButton>
              <Link
                href="/sell"
                className="rounded-full border border-white/25 px-8 py-4 text-[15px] font-semibold text-white transition-colors hover:bg-white/10"
              >
                See how it works
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
