"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Notice } from "./ui";

interface ConfirmOptions {
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  /** "danger" for destructive actions such as delete. */
  tone?: "danger" | "default";
  /**
   * Optional work to run when confirmed. The dialog stays open with a loader
   * until it finishes; return an error message to keep it open and show it.
   */
  action?: () => Promise<string | void>;
}

interface PendingConfirm extends ConfirmOptions {
  resolve: (confirmed: boolean) => void;
}

/**
 * Promise-based replacement for window.confirm with the portal's styling.
 *
 *   const { confirm, dialog } = useConfirm();
 *   if (await confirm({ title: "Delete product?", tone: "danger", action: () => remove() })) { … }
 *   return <>{…}{dialog}</>;
 */
export function useConfirm() {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => new Promise<boolean>((resolve) => setPending({ ...options, resolve })), []);

  const close = (confirmed: boolean) => {
    pending?.resolve(confirmed);
    setPending(null);
  };

  const dialog = <ConfirmDialog request={pending} onClose={close} />;
  return { confirm, dialog };
}

function ConfirmDialog({ request, onClose }: { request: PendingConfirm | null; onClose(confirmed: boolean): void }) {
  return <AnimatePresence>{request && <DialogPanel key="confirm" request={request} onClose={onClose} />}</AnimatePresence>;
}

/** Mounted fresh for each request, so the loading and error state start clean. */
function DialogPanel({ request, onClose }: { request: PendingConfirm; onClose(confirmed: boolean): void }) {
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const danger = request.tone === "danger";

  useEffect(() => {
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // Bound once per opened dialog.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirm = async () => {
    if (!request.action) return onClose(true);
    setWorking(true);
    setError(null);
    const failure = await request.action();
    if (failure) {
      setWorking(false);
      setError(failure);
      return;
    }
    onClose(true);
  };

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center p-4">
      <motion.button
        type="button"
        aria-label="Cancel"
        tabIndex={-1}
        className="absolute inset-0 bg-night/45 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => !working && onClose(false)}
      />
      <motion.div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby={request.description ? "confirm-description" : undefined}
        className="relative w-full max-w-[420px] rounded-2xl border border-line bg-surface p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.45)]"
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex gap-4">
          <span
            className={
              danger ? "grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#fdecec] text-[#a1261b]" : "grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent-soft text-accent-ink"
            }
          >
            <Icon name={danger ? "close" : "check"} size={18} />
          </span>
          <div className="min-w-0 pt-1">
            <h2 id="confirm-title" className="font-sans text-[1.05rem] font-semibold tracking-normal">
              {request.title}
            </h2>
            {request.description && (
              <div id="confirm-description" className="mt-1.5 text-[0.9rem] leading-relaxed text-mute">
                {request.description}
              </div>
            )}
          </div>
        </div>
        {error && (
          <div className="mt-4">
            <Notice>{error}</Notice>
          </div>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onClose(false)} disabled={working}>
            Cancel
          </Button>
          <Button ref={confirmRef} type="button" size="sm" variant={danger ? "danger" : "primary"} loading={working} onClick={confirm}>
            {working ? "Working…" : (request.confirmLabel ?? "Confirm")}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
