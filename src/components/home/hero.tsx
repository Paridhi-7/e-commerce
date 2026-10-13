"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { SmartImage } from "@/components/ui";
import { LinkButton } from "@/components/buttons";

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.08 * i, ease: [0.21, 0.6, 0.35, 1] as const },
  }),
};

const collage = [
  {
    src: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    alt: "Headphones",
    cls: "left-[2%] top-[6%] w-[46%] aspect-[4/5] rotate-[-3deg]",
    delay: 0.35,
  },
  {
    src: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=800&q=80",
    alt: "Ceramic mug",
    cls: "left-[40%] top-[30%] w-[34%] aspect-square rotate-[2deg] z-10",
    delay: 0.5,
  },
  {
    src: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
    alt: "Leather bag",
    cls: "right-[0%] top-[2%] w-[38%] aspect-[3/4] rotate-[3deg]",
    delay: 0.62,
  },
  {
    src: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=800&q=80",
    alt: "Notebook",
    cls: "left-[6%] bottom-[4%] w-[34%] aspect-square rotate-[2deg]",
    delay: 0.74,
  },
  {
    src: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
    alt: "Wallet",
    cls: "right-[8%] bottom-[8%] w-[40%] aspect-[4/3] rotate-[-2deg] z-10",
    delay: 0.86,
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-accent-soft blur-3xl opacity-70" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(24,24,27,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(24,24,27,0.05) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent 70%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent 70%)",
          }}
        />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-8 lg:px-8 lg:pb-24 lg:pt-20">
        {/* copy */}
        <div className="max-w-xl">
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent-border bg-accent-soft px-3.5 py-1.5 text-[12px] font-semibold text-accent">
              <Sparkles size={13} />
              120+ independent studios · new drops weekly
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="display mt-6 text-[clamp(2.6rem,6vw,4.3rem)]"
          >
            Many makers.
            <br />
            <span className="text-gradient">One checkout.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="mt-6 text-lg leading-relaxed text-muted"
          >
            KARTIFY is a marketplace that gathers hundreds of independent vendors —
            each with their own storefront — into one shop. Browse everything, fill a
            single cart, and check out once, no matter how many sellers you buy from.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <LinkButton href="/marketplace" size="lg">
              Start shopping
              <ArrowRight size={17} />
            </LinkButton>
            <LinkButton href="/vendors" variant="outline" size="lg">
              Meet the vendors
            </LinkButton>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={4}
            className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-[13px] text-muted"
          >
            <span className="flex items-center gap-2">
              <Truck size={15} className="text-accent" /> Free shipping over $150
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-accent" /> Buyer protection on every order
            </span>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={5}
            className="mt-10 flex items-center gap-6 border-t border-line pt-6"
          >
            {[
              ["120+", "curated vendors"],
              ["48k", "products sold"],
              ["4.8★", "avg. rating"],
            ].map(([n, l]) => (
              <div key={l}>
                <p className="tabular text-2xl font-extrabold tracking-tight">{n}</p>
                <p className="text-[12px] text-muted">{l}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* collage */}
        <div className="relative mx-auto w-full max-w-[520px]">
          <div className="relative aspect-[4/4.4]">
            {collage.map((c, i) => (
              <motion.div
                key={c.alt}
                initial={{ opacity: 0, y: 30, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: c.delay, ease: [0.21, 0.6, 0.35, 1] }}
                whileHover={{ scale: 1.04, rotate: 0, zIndex: 20 }}
                className={`absolute overflow-hidden rounded-2xl border border-line bg-surface shadow-card-hover ${c.cls}`}
                style={{ zIndex: i === 1 || i === 4 ? 10 : 5 - i }}
              >
                <SmartImage src={c.src} alt={c.alt} sizes="300px" className="object-cover" priority={i < 2} />
              </motion.div>
            ))}

            {/* floating card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.05 }}
              className="absolute -left-2 bottom-[38%] z-20 hidden rounded-2xl border border-line bg-surface/95 p-3.5 shadow-pop backdrop-blur sm:block"
            >
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full">
                  <SmartImage
                    src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=200&q=80"
                    alt="Atelier Nord"
                    sizes="40px"
                  />
                </div>
                <div>
                  <p className="text-[13px] font-bold">Glaze Study Mug 01</p>
                  <p className="text-[12px] text-muted">
                    Atelier Nord · <span className="font-semibold text-foreground">$38</span>
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.2 }}
              className="absolute right-[4%] top-[46%] z-20 hidden items-center gap-2 rounded-full border border-line bg-surface/95 py-2 pl-2 pr-4 shadow-pop backdrop-blur sm:flex"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-success-soft text-success">
                <ShieldCheck size={14} />
              </span>
              <span className="text-[12px] font-semibold">Order protected</span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
