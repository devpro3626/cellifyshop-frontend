"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

export interface FlashMessage {
  tone: "error" | "success";
  text: string;
}

/** How long a message stays before it fades out on its own. */
const DURATION = { success: 3500, error: 9000 };

/** Status message state that clears itself after a few seconds. */
export function useFlash() {
  const [flash, setFlash] = useState<FlashMessage | null>(null);

  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(null), DURATION[flash.tone]);
    return () => clearTimeout(timer);
  }, [flash]);

  return [flash, setFlash] as const;
}

/** Fading status message with a dismiss button. Renders nothing when empty. */
export function Flash({ flash, onDismiss, className }: { flash: FlashMessage | null; onDismiss(): void; className?: string }) {
  return (
    <AnimatePresence initial={false}>
      {flash && (
        <motion.div
          key={flash.text}
          role={flash.tone === "error" ? "alert" : "status"}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className={cn("flex items-start gap-2 rounded-lg py-2 pr-1.5 pl-3 text-[0.88rem]", flash.tone === "error" ? "bg-[#fdecec] text-[#a1261b]" : "bg-[#e8f5ee] text-ok", className)}
        >
          <span className="min-w-0 flex-1 pt-px">{flash.text}</span>
          <button type="button" onClick={onDismiss} aria-label="Dismiss" className="grid h-6 w-6 shrink-0 place-items-center rounded-md opacity-70 hover:bg-black/5 hover:opacity-100">
            <Icon name="close" size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
