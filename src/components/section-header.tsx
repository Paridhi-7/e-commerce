import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./ui";

export function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-xl">
        <p className="eyebrow text-accent">{eyebrow}</p>
        <h2 className="h2 mt-2">{title}</h2>
        {description && (
          <p className="mt-3 text-[15px] leading-relaxed text-muted">{description}</p>
        )}
      </div>
      {href && linkLabel && (
        <Link
          href={href}
          className="group inline-flex items-center gap-1.5 rounded-full border border-line-strong px-4 py-2 text-sm font-semibold transition-all hover:border-accent hover:text-accent"
        >
          {linkLabel}
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </Reveal>
  );
}
