"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { bag, useBag, type BagLine } from "@/lib/bag/store";
import { formatPrice, productUrl, whatsappLink } from "@/lib/format";
import { smoothScroll } from "@/lib/scroll";
import { buttonClass } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/** Order summary for WhatsApp; each line links back to the exact variant. */
function orderMessage(lines: BagLine[], subtotal: number) {
  const rows = lines.map(
    (l) => `• ${l.quantity} × ${l.name} (${l.description}): ${formatPrice(l.price * l.quantity)}\n  ${l.url ?? productUrl(l.productId)}`,
  );
  return [`Hi CellifyShop, I'd like to order:`, ``, ...rows, ``, `Subtotal: ${formatPrice(subtotal)}`].join("\n");
}

export function BagDrawer() {
  const { lines, open, count, subtotal } = useBag();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && bag.setOpen(false);
    window.addEventListener("keydown", onKey);
    smoothScroll.stop();
    return () => {
      window.removeEventListener("keydown", onKey);
      smoothScroll.start();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60]">
          <motion.button
            type="button"
            aria-label="Close bag"
            className="absolute inset-0 bg-night/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => bag.setOpen(false)}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Your bag"
            className="absolute inset-y-0 right-0 flex w-full max-w-[440px] flex-col bg-paper shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <p className="font-display text-xl font-semibold tracking-[-0.03em]">
                Bag <span className="text-mute">({count})</span>
              </p>
              <button type="button" onClick={() => bag.setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-ink/5" aria-label="Close bag">
                <Icon name="close" />
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-paper-2">
                  <Icon name="bag" size={26} />
                </div>
                <div>
                  <p className="font-display text-2xl font-semibold tracking-[-0.03em]">Your bag is empty.</p>
                  <p className="mt-2 text-sm text-mute">Find your next iPhone, or the accessory that completes it.</p>
                </div>
                <Link href="/products" onClick={() => bag.setOpen(false)} className={buttonClass({ variant: "dark" })}>
                  Browse the store
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-line overflow-y-auto px-6" data-lenis-prevent>
                  <AnimatePresence initial={false}>
                    {lines.map((line) => (
                      <motion.li key={line.id} layout exit={{ opacity: 0, x: 40 }} className="flex gap-4 py-5">
                        <Link
                          href={`/product/${line.productId}`}
                          onClick={() => bag.setOpen(false)}
                          className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl"
                          style={{ backgroundColor: line.tint }}
                        >
                          <Image src={line.image} alt="" fill sizes="96px" className="object-contain p-1.5" />
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-medium leading-snug">{line.name}</p>
                              <p className="mt-0.5 text-[0.8rem] text-mute">{line.description}</p>
                            </div>
                            <p className="shrink-0 font-medium tabular-nums">{formatPrice(line.price * line.quantity)}</p>
                          </div>
                          <div className="mt-auto flex items-center justify-between pt-3">
                            <div className="flex items-center rounded-full border border-line">
                              <button type="button" className="grid h-8 w-8 place-items-center" aria-label={`Decrease quantity of ${line.name}`} onClick={() => bag.setQuantity(line.id, line.quantity - 1)}>
                                <Icon name="minus" size={14} />
                              </button>
                              <span className="w-6 text-center text-sm tabular-nums" aria-live="polite">
                                {line.quantity}
                              </span>
                              <button type="button" className="grid h-8 w-8 place-items-center" aria-label={`Increase quantity of ${line.name}`} onClick={() => bag.setQuantity(line.id, line.quantity + 1)}>
                                <Icon name="plus" size={14} />
                              </button>
                            </div>
                            <button type="button" onClick={() => bag.remove(line.id)} className="text-[0.8rem] text-mute underline-offset-4 hover:text-ink hover:underline">
                              Remove
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>

                <div className="space-y-4 border-t border-line bg-surface px-6 py-6">
                  <div className="flex items-baseline justify-between">
                    <span className="text-mute">Subtotal</span>
                    <span className="font-display text-2xl font-semibold tracking-[-0.03em] tabular-nums">{formatPrice(subtotal)}</span>
                  </div>
                  <p className="text-xs text-mute">Free collection in store. Delivery is calculated when we confirm your order.</p>
                  <a href={whatsappLink(orderMessage(lines, subtotal))} target="_blank" rel="noreferrer" className={buttonClass({ variant: "primary", size: "lg", className: "w-full" })}>
                    <Icon name="whatsapp" size={18} />
                    Check out on WhatsApp
                  </a>
                  <button type="button" onClick={() => bag.setOpen(false)} className="w-full text-center text-sm text-mute hover:text-ink">
                    Continue shopping
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
