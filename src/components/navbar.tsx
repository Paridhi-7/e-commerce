"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  ShoppingBag,
  Store,
  User,
  X,
} from "lucide-react";
import { cartCount, cartStore, signOut, useStore, userStore } from "@/lib/shop";
import { CATEGORIES } from "@/lib/products";

const NAV = [
  { label: "Marketplace", href: "/marketplace" },
  { label: "Vendors", href: "/vendors" },
  { label: "Sell on KARTIFY", href: "/sell" },
];

export function Navbar() {
  const pathname = usePathname();
  const cart = useStore(cartStore);
  const user = useStore(userStore);
  const role = user?.role ?? null;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMobileOpen(false);
      setCatsOpen(false);
      setAccountOpen(false);
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  const dashHref =
    role === "vendor" ? "/vendor-dashboard" : role === "admin" ? "/admin" : "/account";

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-line bg-surface/85 shadow-sm backdrop-blur-xl"
          : "border-transparent bg-surface/60 backdrop-blur-md"
      }`}
    >
      {/* announcement bar */}
      <div className="hidden bg-foreground text-center text-[12px] font-medium text-white sm:block">
        <p className="py-2 tracking-wide">
          Free shipping over $150 · 30-day returns ·{" "}
          <Link href="/sell" className="underline underline-offset-2 hover:text-white/70">
            Become a seller
          </Link>
        </p>
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        {/* logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
            <ShoppingBag size={16} strokeWidth={2.2} />
          </span>
          <span className="text-[17px] font-extrabold tracking-tight">KARTIFY</span>
        </Link>

        {/* desktop nav */}
        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          <div
            className="relative"
            onMouseEnter={() => setCatsOpen(true)}
            onMouseLeave={() => setCatsOpen(false)}
          >
            <button className="flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-muted hover:text-foreground">
              Categories <ChevronDown size={14} className={`transition-transform ${catsOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {catsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.18 }}
                  className="absolute left-0 top-full w-64 rounded-2xl border border-line bg-surface p-2 shadow-pop"
                >
                  {CATEGORIES.map((c) => (
                    <Link
                      key={c.name}
                      href={`/marketplace?category=${encodeURIComponent(c.name)}`}
                      className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-foreground/80 transition-colors hover:bg-surface-muted hover:text-foreground"
                    >
                      {c.name}
                      <ChevronDown size={13} className="-rotate-90 text-subtle" />
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                pathname.startsWith(item.href)
                  ? "bg-surface-muted text-foreground"
                  : "text-muted hover:bg-surface-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* search */}
        <form
          action="/marketplace"
          className="relative ml-auto hidden w-full max-w-xs md:block"
          role="search"
        >
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" />
          <input
            name="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products, vendors…"
            className="h-10 w-full rounded-full border border-line bg-surface-muted/60 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-subtle focus:border-accent-border focus:bg-surface focus:ring-4 focus:ring-accent/10"
          />
        </form>

        {/* actions */}
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          {/* account */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setAccountOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
            >
              <User size={17} />
              <span className="hidden xl:inline">{role ? "Account" : "Sign in"}</span>
              <ChevronDown size={13} />
            </button>
            <AnimatePresence>
              {accountOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-full mt-1 w-56 rounded-2xl border border-line bg-surface p-2 shadow-pop"
                >
                  {role ? (
                    <>
                      <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-subtle">
                        Signed in as {user?.name} · {role}
                      </div>
                      <MenuLink href={dashHref} icon={LayoutDashboard} label="Dashboard" />
                      {role === "customer" && (
                        <MenuLink href="/account" icon={User} label="My account" />
                      )}
                      <button
                        onClick={() => {
                          signOut();
                          setAccountOpen(false);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-danger transition-colors hover:bg-danger-soft"
                      >
                        <LogOut size={15} /> Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <MenuLink href="/account" icon={User} label="Customer sign in" />
                      <MenuLink href="/vendor-dashboard" icon={Store} label="Vendor dashboard" />
                      <MenuLink href="/admin" icon={ShieldCheck} label="Admin console" />
                      <div className="my-1 border-t border-line" />
                      <MenuLink href="/login" icon={User} label="Login" />
                      <MenuLink href="/signup" icon={User} label="Create account" />
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            href="/account?tab=saved"
            aria-label="Saved items"
            className="relative hidden h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-muted hover:text-foreground sm:flex"
          >
            <Heart size={18} />
          </Link>

          <CartLink count={cartCount(cart.map((l) => l.line))} />
        </div>

        {/* mobile toggle */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full text-foreground lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-line bg-surface lg:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              <form action="/marketplace" className="relative mb-3" role="search">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" />
                <input
                  name="q"
                  placeholder="Search products, vendors…"
                  className="h-11 w-full rounded-full border border-line bg-surface-muted/60 pl-10 pr-4 text-sm outline-none focus:border-accent-border focus:bg-surface"
                />
              </form>
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-surface-muted"
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-2 text-xs font-semibold uppercase tracking-wide text-subtle">Categories</div>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <Link
                    key={c.name}
                    href={`/marketplace?category=${encodeURIComponent(c.name)}`}
                    className="rounded-full border border-line px-3 py-1.5 text-[13px] text-muted hover:border-accent-border hover:text-accent"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
              <div className="my-2 border-t border-line" />
              <Link href="/account" className="block rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-surface-muted">
                Sign in / Account
              </Link>
              <Link href="/vendor-dashboard" className="block rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-surface-muted">
                Vendor dashboard
              </Link>
              <Link href="/admin" className="block rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-surface-muted">
                Admin console
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-foreground/80 transition-colors hover:bg-surface-muted hover:text-foreground"
    >
      <Icon size={15} /> {label}
    </Link>
  );
}

function CartLink({ count }: { count: number }) {
  const key = `cart-${count}`;
  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${count} items`}
      className="relative flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-white transition-all hover:bg-zinc-700"
    >
      <motion.span
        key={key}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 0.3 }}
        className="inline-flex"
      >
        <ShoppingBag size={16} />
      </motion.span>
      <span className="tabular text-sm font-semibold">{count}</span>
    </Link>
  );
}
