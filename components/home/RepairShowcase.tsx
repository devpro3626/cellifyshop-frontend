"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useState } from "react";
import { formatPrice } from "@/lib/format";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export interface RepairRow {
  id: string;
  name: string;
  summary: string;
  image: string;
  tint: string;
  fromPrice: number;
  turnaround: string;
}

const STEPS = [
  { icon: "phone", title: "Book or walk in", body: "Message us on WhatsApp or just drop by. No appointment needed." },
  { icon: "search", title: "Free diagnosis", body: "A 15-minute check and a fixed quote before any work starts." },
  { icon: "wrench", title: "Expert repair", body: "Certified technicians, genuine or premium parts, your data untouched." },
  { icon: "shield", title: "Collect and go", body: "Fully tested on handover, with up to 12 months' warranty." },
] as const;

/** Editorial price list. On desktop a preview image follows the cursor. */
export function RepairShowcase({ rows }: { rows: RepairRow[] }) {
  const [hovered, setHovered] = useState<RepairRow | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 28 });
  const sy = useSpring(y, { stiffness: 260, damping: 28 });

  return (
    <section className="bg-paper-2 py-24 md:py-32">
      <div className="shell">
        <Reveal>
          <SectionHeading
            eyebrow="Same-day repair"
            title="Walk in broken. Walk out fixed."
            subtitle="Clear prices, shown before we start."
            action={
              <ButtonLink href="/products/repairs" variant="dark" arrow>
                All repairs
              </ButtonLink>
            }
          />
        </Reveal>

        <ul
          className="relative mt-14 border-t border-line-strong"
          onPointerMove={(e) => {
            x.set(e.clientX);
            y.set(e.clientY);
          }}
          onPointerLeave={() => setHovered(null)}
        >
          {rows.map((row, i) => (
            <Reveal as="li" key={row.id} delay={i * 0.04} y={16} onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(row)}>
                <Link href={`/product/${row.id}`} className="group grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 border-b border-line-strong py-6 md:grid-cols-[3rem_1.3fr_1fr_auto_auto] md:py-8">
                  <span className="hidden font-medium tabular-nums text-xs text-mute md:block">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-display text-[clamp(1.2rem,2.2vw,1.77rem)] font-semibold tracking-[-0.04em] transition-transform duration-500 ease-out-expo group-hover:translate-x-2">{row.name}</span>
                  <span className="col-span-2 row-start-2 text-[0.92rem] text-mute md:col-span-1 md:row-start-auto">{row.summary}</span>
                  <span className="hidden items-center gap-2 text-sm text-mute md:flex">
                    <Icon name="clock" size={16} /> {row.turnaround}
                  </span>
                  <span className="col-start-2 row-start-1 flex items-center gap-4 md:col-start-auto md:row-start-auto">
                    <span className="text-right">
                      <span className="block text-[0.72rem] text-mute">from</span>
                      <span className="font-display text-xl font-semibold tabular-nums tracking-[-0.03em]">{formatPrice(row.fromPrice)}</span>
                    </span>
                    <span className="hidden h-10 w-10 place-items-center rounded-full border border-line-strong transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-white sm:grid">
                      <Icon name="arrowUpRight" size={18} />
                    </span>
                  </span>
                </Link>
            </Reveal>
          ))}
        </ul>

        <ol className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <Reveal as="li" key={step.title} delay={i * 0.08} className="relative">
                <div className="flex items-center gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-ink text-white">
                    <Icon name={step.icon} />
                  </span>
                  <span className="h-px flex-1 bg-line-strong" aria-hidden="true" />
                </div>
                <p className="mt-6 font-medium tabular-nums text-xs text-mute">Step {i + 1}</p>
                <p className="mt-1 font-display text-lg font-semibold tracking-[-0.02em]">{step.title}</p>
                <p className="mt-2 text-[0.92rem] leading-relaxed text-mute">{step.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>

      <AnimatePresence>
        {hovered && (
          <motion.div
            key="preview"
            aria-hidden="true"
            className="pointer-events-none fixed left-0 top-0 z-30 hidden h-60 w-60 overflow-hidden rounded-3xl shadow-2xl md:block"
            style={{ x: sx, y: sy, translateX: "-50%", translateY: "-115%", backgroundColor: hovered.tint }}
            initial={{ opacity: 0, scale: 0.6, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <AnimatePresence mode="popLayout">
              <motion.div key={hovered.id} className="absolute inset-0" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                <Image src={hovered.image} alt="" fill sizes="240px" className="object-cover" />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
