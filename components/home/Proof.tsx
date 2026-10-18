"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";

const STATS = [
  { value: 12400, suffix: "+", label: "Devices repaired", decimals: 0 },
  { value: 4.9, suffix: "/5", label: "Average customer rating", decimals: 1 },
  { value: 48, suffix: "", label: "Checks on every pre-owned iPhone", decimals: 0 },
  { value: 92, suffix: "%", label: "Repairs finished the same day", decimals: 0 },
];

const REVIEWS = [
  { quote: "Screen replaced in under an hour, and Face ID still works perfectly. The quoted price was the price I paid.", name: "Amara K.", detail: "iPhone 15 Pro · Screen" },
  { quote: "Bought a pre-owned 16 Pro. Battery at 98% and it looks brand new. The inspection report was a nice touch.", name: "Daniel R.", detail: "iPhone 16 Pro · Like new" },
  { quote: "They cleaned my charging port for free instead of selling me a replacement. Honest people.", name: "Sofia M.", detail: "iPhone 13 · Port" },
  { quote: "Water damage after a beach day. They saved the phone and every photo on it.", name: "Jonah T.", detail: "iPhone 14 · Water damage" },
  { quote: "Traded in my old phone and walked out with a 17 Pro the same afternoon. Painless.", name: "Lina A.", detail: "iPhone 17 Pro · New" },
  { quote: "Battery swap took thirty minutes. I waited with a coffee next door.", name: "Marcus O.", detail: "iPhone 12 · Battery" },
];

function Counter({ value, decimals, suffix }: { value: number; decimals: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -20% 0px" });
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    const format = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
    if (reduce) {
      el.textContent = format(value);
      return;
    }
    const controls = animate(0, value, { duration: 2, ease: [0.16, 1, 0.3, 1], onUpdate: (n) => (el.textContent = format(n)) });
    return () => controls.stop();
  }, [inView, value, decimals, suffix, reduce]);

  return <span ref={ref}>0{suffix}</span>;
}

export function Proof() {
  return (
    <section className="overflow-hidden bg-paper pb-24 md:pb-32">
      <div className="shell">
        <dl className="grid grid-cols-2 border-t border-line-strong lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08} className="flex flex-col-reverse border-b border-line-strong py-10 pr-6 lg:border-r lg:border-b-0 lg:last:border-r-0 lg:[&:not(:first-child)]:pl-8">
              <dt className="mt-3 text-[0.92rem] text-mute">{stat.label}</dt>
              <dd className="font-display text-[clamp(2.08rem,3.4vw,2.99rem)] leading-none font-semibold tracking-[-0.05em] tabular-nums">
                <Counter value={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>

      <div className="mt-20">
        <div className="shell mb-8 flex items-center gap-3">
          <span className="flex text-accent" aria-hidden="true">
            {Array.from({ length: 5 }, (_, i) => (
              <Icon key={i} name="star" size={18} fill="currentColor" />
            ))}
          </span>
          <p className="text-sm text-mute">Rated 4.9 from more than 2,300 reviews</p>
        </div>
        <div className="group relative flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
          <ul className="animate-marquee flex w-max gap-4 pr-4 group-hover:[animation-play-state:paused]" style={{ ["--marquee-duration" as string]: "60s" }}>
            {[...REVIEWS, ...REVIEWS].map((review, i) => (
              <li key={i} aria-hidden={i >= REVIEWS.length} className="w-[320px] shrink-0 rounded-[24px] border border-line bg-surface p-7 md:w-[400px]">
                <blockquote className="text-[1.02rem] leading-relaxed">&ldquo;{review.quote}&rdquo;</blockquote>
                <p className="mt-6 text-sm font-medium">{review.name}</p>
                <p className="text-[0.8rem] text-mute">{review.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
