"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CreditCard,
  Lock,
  MapPin,
  ShoppingBag,
  Truck,
  Wallet,
  Building2,
} from "lucide-react";
import {
  cartStore,
  cartTotals,
  detailedCart,
  placeOrder,
  toast,
  useStore,
} from "@/lib/shop";
import type { DetailedLine } from "@/lib/types";
import { money, vendorHref } from "@/lib/format";
import { SmartImage } from "@/components/ui";
import { Button, LinkButton } from "@/components/buttons";

const PAYMENTS = [
  { id: "card", label: "Card", icon: CreditCard, note: "Visa, Mastercard, Amex" },
  { id: "wallet", label: "KARTIFY Wallet", icon: Wallet, note: "Balance $242.00" },
  { id: "bank", label: "Bank transfer", icon: Building2, note: "SEPA / ACH" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useStore(cartStore);
  const items = useMemo(() => detailedCart(cart), [cart]);
  const { subtotal, shipping, total } = cartTotals(items);

  const groups = useMemo(() => {
    const map = new Map<string, DetailedLine[]>();
    for (const item of items) {
      const arr = map.get(item.product.vendorId) ?? [];
      arr.push(item);
      map.set(item.product.vendorId, arr);
    }
    return [...map.entries()];
  }, [items]);

  const [payment, setPayment] = useState("card");
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({
    name: "Alex Morgan",
    email: "alex@example.com",
    street: "482 Mercer Street, Apt 5B",
    city: "New York",
    zip: "10012",
    phone: "+1 (212) 555-0148",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setPlacing(true);
    const order = await placeOrder({
      address: {
        name: form.name,
        street: form.street,
        city: form.city,
        zip: form.zip,
        phone: form.phone,
      },
      payment: PAYMENTS.find((p) => p.id === payment)?.label ?? "Card",
    });
    setPlacing(false);
    if (order) {
      toast("Order placed", `Confirmation sent to ${form.email}`);
      router.push(`/order/${order.id}`);
    }
  };

  if (items.length === 0 && !placing) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-28 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft text-accent">
          <ShoppingBag size={26} />
        </span>
        <h1 className="h2 mt-6">Nothing to check out</h1>
        <p className="mt-2 text-[15px] text-muted">Your cart is waiting to be filled.</p>
        <LinkButton href="/marketplace" size="lg" className="mt-8">
          Browse marketplace
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/cart"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-foreground"
      >
        <ArrowLeft size={15} /> Back to cart
      </Link>
      <h1 className="h1 mt-4">Checkout</h1>
      <p className="mt-2 text-[15px] text-muted">
        One payment, {groups.length} {groups.length === 1 ? "vendor" : "vendors"} — we split
        the order behind the scenes.
      </p>

      <form onSubmit={submit} className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          {/* contact */}
          <section className="rounded-2xl border border-line bg-surface p-6 shadow-card">
            <h2 className="flex items-center gap-2.5 text-base font-bold">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[13px] font-bold text-white">1</span>
              Contact
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Full name" value={form.name} onChange={set("name")} required />
              <Field label="Email" value={form.email} onChange={set("email")} type="email" required />
            </div>
          </section>

          {/* address */}
          <section className="rounded-2xl border border-line bg-surface p-6 shadow-card">
            <h2 className="flex items-center gap-2.5 text-base font-bold">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[13px] font-bold text-white">2</span>
              Shipping address
              <MapPin size={16} className="ml-1 text-subtle" />
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Street address" value={form.street} onChange={set("street")} required className="sm:col-span-2" />
              <Field label="City" value={form.city} onChange={set("city")} required />
              <Field label="ZIP / Postcode" value={form.zip} onChange={set("zip")} required />
              <Field label="Phone" value={form.phone} onChange={set("phone")} type="tel" className="sm:col-span-2" />
            </div>
          </section>

          {/* payment */}
          <section className="rounded-2xl border border-line bg-surface p-6 shadow-card">
            <h2 className="flex items-center gap-2.5 text-base font-bold">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[13px] font-bold text-white">3</span>
              Payment
              <Lock size={14} className="ml-1 text-subtle" />
            </h2>
            <div className="mt-5 space-y-3">
              {PAYMENTS.map((p) => (
                <label
                  key={p.id}
                  className={`flex cursor-pointer items-center gap-3.5 rounded-xl border p-4 transition-all ${
                    payment === p.id
                      ? "border-accent bg-accent-softer ring-1 ring-accent/30"
                      : "border-line hover:border-line-strong"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    className="h-4 w-4 accent-[var(--accent)]"
                    checked={payment === p.id}
                    onChange={() => setPayment(p.id)}
                  />
                  <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${payment === p.id ? "bg-accent text-white" : "bg-surface-muted text-muted"}`}>
                    <p.icon size={16} />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold">{p.label}</span>
                    <span className="block text-[12px] text-muted">{p.note}</span>
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-4 text-[12px] text-subtle">
              This is a portfolio demo — no real payment is processed.
            </p>
          </section>
        </div>

        {/* summary */}
        <aside>
          <div className="sticky top-32 rounded-2xl border border-line bg-surface p-6 shadow-card">
            <h2 className="h3">Order summary</h2>

            <div className="mt-5 max-h-72 space-y-5 overflow-y-auto pr-1">
              {groups.map(([vendorId, lines]) => (
                <div key={vendorId}>
                  <Link
                    href={vendorHref(lines[0].vendorSlug)}
                    className="text-[12px] font-bold uppercase tracking-wide text-muted hover:text-accent"
                  >
                    {lines[0].vendorName}
                  </Link>
                  <div className="mt-2 space-y-3">
                    {lines.map((i) => (
                      <div key={i.line.slug} className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                          <SmartImage src={i.product.img} alt="" sizes="48px" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-semibold">{i.product.name}</p>
                          <p className="text-[12px] text-muted">Qty {i.line.qty}</p>
                        </div>
                        <p className="tabular text-[13px] font-semibold">
                          {money(i.product.price * i.line.qty)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <dl className="mt-5 space-y-3 border-t border-line pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="tabular font-semibold">{money(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Shipping</dt>
                <dd className="tabular font-semibold">
                  {shipping === 0 ? <span className="text-success">Free</span> : money(shipping)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-line pt-3 text-base">
                <dt className="font-bold">Total</dt>
                <dd className="tabular font-extrabold">{money(total)}</dd>
              </div>
            </dl>

            <Button
              type="submit"
              size="lg"
              className="mt-6 w-full"
              disabled={placing}
            >
              {placing ? (
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  Processing…
                </motion.span>
              ) : (
                <>
                  <Lock size={15} /> Pay {money(total)}
                </>
              )}
            </Button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-subtle">
              <Truck size={13} /> Estimated delivery in 4–6 days
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Field({
  label,
  className = "",
  ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[13px] font-semibold">{label}</span>
      <input
        {...rest}
        className="h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-sm outline-none transition-all placeholder:text-subtle focus:border-accent-border focus:ring-4 focus:ring-accent/10"
      />
    </label>
  );
}
