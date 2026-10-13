import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  Percent,
  ShieldCheck,
  Store,
  Truck,
} from "lucide-react";
import { LinkButton } from "@/components/buttons";
import { Reveal } from "@/components/ui";

export const metadata: Metadata = {
  title: "Sell on KARTIFY",
  description:
    "Open a branded storefront on KARTIFY — dashboard, analytics, and one checkout shared with 100+ vendors.",
};

const STEPS = [
  { title: "Apply in minutes", body: "Tell us about your studio and what you make. No listing fees to start." },
  { title: "Get reviewed", body: "Our curation team reviews every application within 48 hours." },
  { title: "Open your storefront", body: "Add your branding, story and catalog — you're live on the marketplace." },
];

const PERKS = [
  { icon: Store, title: "Your own storefront", body: "Custom logo, banner, story page — not a cramped seller profile." },
  { icon: BarChart3, title: "Real analytics", body: "Sales trends, order pipeline and low-stock alerts at a glance." },
  { icon: Percent, title: "Simple pricing", body: "5% commission on marketplace sales. No monthly fee, ever." },
  { icon: Truck, title: "Shared logistics", body: "Consolidated shipping labels and discounted rates from day one." },
  { icon: ShieldCheck, title: "Buyer trust", body: "Buyer protection and verified reviews convert visitors for you." },
];

export default function SellPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow text-accent">For makers & studios</p>
        <h1 className="display mt-4 text-[clamp(2.2rem,5vw,3.6rem)]">
          Sell where curation
          <br />
          <span className="text-gradient">does the marketing.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted">
          KARTIFY vendors get a branded storefront, a real dashboard, and customers who
          arrived ready to discover. You focus on the craft.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <LinkButton href="/signup?type=vendor" size="lg">
            Apply to sell <ArrowRight size={17} />
          </LinkButton>
          <LinkButton href="/vendor-dashboard" variant="outline" size="lg">
            Preview the dashboard
          </LinkButton>
        </div>
      </div>

      <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PERKS.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.06}>
            <div className="h-full rounded-2xl border border-line bg-surface p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <p.icon size={19} />
              </span>
              <h3 className="mt-4 text-base font-bold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
            </div>
          </Reveal>
        ))}
        <Reveal delay={0.3}>
          <div className="flex h-full flex-col justify-between rounded-2xl bg-foreground p-6 text-white">
            <div>
              <p className="eyebrow text-indigo-300">Commission</p>
              <p className="display mt-3 text-5xl">5%</p>
              <p className="mt-2 text-sm text-zinc-300">
                of each marketplace sale. Payment processing included.
              </p>
            </div>
            <ul className="mt-6 space-y-2 text-[13px] text-zinc-300">
              {["No listing fees", "No monthly fee", "Payouts weekly"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Check size={14} className="text-indigo-300" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>

      <div className="mt-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="h1">Live in three steps</h2>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1}>
              <div className="relative rounded-2xl border border-line bg-surface p-6 shadow-card">
                <span className="tabular absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-extrabold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-3 text-base font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal className="mt-20 text-center">
        <div className="rounded-3xl border border-line bg-surface p-10 shadow-card">
          <h2 className="h2">Ready to open your storefront?</h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] text-muted">
            Applications take about five minutes. We review every one personally.
          </p>
          <LinkButton href="/signup?type=vendor" size="lg" className="mt-6">
            Start application <ArrowRight size={17} />
          </LinkButton>
          <p className="mt-4 text-[12px] text-subtle">
            Already selling? <Link href="/login" className="font-semibold text-accent hover:underline">Sign in</Link>
          </p>
        </div>
      </Reveal>
    </div>
  );
}
