import Link from "next/link";
import { LinkButton } from "@/components/buttons";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-28 text-center">
      <p className="display text-7xl text-gradient">404</p>
      <h1 className="h2 mt-4">Page not found</h1>
      <p className="mt-2 text-[15px] text-muted">
        The page you&apos;re looking for doesn&apos;t exist or was moved.
      </p>
      <div className="mt-8 flex gap-3">
        <LinkButton href="/">Back home</LinkButton>
        <LinkButton href="/marketplace" variant="outline">
          Browse marketplace
        </LinkButton>
      </div>
      <p className="mt-6 text-[13px] text-subtle">
        Or{" "}
        <Link href="/vendors" className="font-semibold text-accent hover:underline">
          meet the vendors
        </Link>
      </p>
    </div>
  );
}
