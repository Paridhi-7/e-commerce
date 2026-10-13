"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { toastStore, useStore } from "@/lib/shop";
import { SmartImage } from "./ui";

export function Toasts() {
  const toasts = useStore(toastStore);
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[70] flex w-[calc(100vw-2.5rem)] max-w-sm flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 shadow-pop"
          >
            {t.image ? (
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-surface-muted">
                <SmartImage src={t.image} alt="" sizes="44px" />
              </div>
            ) : (
              <CheckCircle2 size={22} className="shrink-0 text-success" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold">{t.title}</p>
              {t.description && (
                <p className="truncate text-[13px] text-muted">{t.description}</p>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
