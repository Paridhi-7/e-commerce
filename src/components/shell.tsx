"use client";

import type { ReactNode } from "react";
import { useHydrateShops } from "@/lib/shop";

export function Shell({ children }: { children: ReactNode }) {
  useHydrateShops();
  return <>{children}</>;
}
