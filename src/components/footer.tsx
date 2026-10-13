import Link from "next/link";
import { ShoppingBag } from "lucide-react";

const COLS = [
  {
    title: "Marketplace",
    links: [
      { label: "Browse all", href: "/marketplace" },
      { label: "Vendors", href: "/vendors" },
      { label: "New arrivals", href: "/marketplace?sort=newest" },
      { label: "Bestsellers", href: "/marketplace?sort=popular" },
    ],
  },
  {
    title: "Sell",
    links: [
      { label: "Why KARTIFY", href: "/sell" },
      { label: "Vendor dashboard", href: "/vendor-dashboard" },
      { label: "Apply to sell", href: "/signup?type=vendor" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Your account", href: "/account" },
      { label: "Shipping & returns", href: "/marketplace" },
      { label: "Help center", href: "/marketplace" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
                <ShoppingBag size={16} strokeWidth={2.2} />
              </span>
              <span className="text-[17px] font-extrabold tracking-tight">KARTIFY</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              A curated marketplace of independent makers. One cart, many storefronts,
              one checkout.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs text-subtle">
              <span className="rounded-full border border-line px-3 py-1">Secure checkout</span>
              <span className="rounded-full border border-line px-3 py-1">Buyer protection</span>
              <span className="rounded-full border border-line px-3 py-1">Carbon-neutral delivery</span>
            </div>
          </div>
          {COLS.map((col) => (
            <div key={col.title}>
              <h4 className="text-[13px] font-bold uppercase tracking-wider">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted transition-colors hover:text-accent"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 text-[13px] text-subtle sm:flex-row">
          <p>© 2026 KARTIFY Marketplace Inc. A portfolio concept.</p>
          <div className="flex gap-6">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
