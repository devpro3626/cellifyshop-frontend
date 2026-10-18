"use client";

import { AnimatePresence, motion } from "motion/react";
import { useAdminBusy } from "@/lib/admin/busy";

/** Thin gradient bar across the top of the admin while an action is running. */
export function ProgressBar() {
  const busy = useAdminBusy();
  return (
    <AnimatePresence>
      {busy && (
        <motion.div
          role="progressbar"
          aria-label="Working"
          className="fixed inset-x-0 top-0 z-[80] h-[3px] overflow-hidden bg-accent/15"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { delay: 0.15 } }}
        >
          <div className="animate-progress h-full w-full origin-left bg-gradient-to-r from-transparent via-accent to-[#7fd6cb]" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
