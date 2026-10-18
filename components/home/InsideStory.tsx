"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useRef, useState } from "react";
import { cn } from "@/lib/cn";

const STEPS = [
  {
    title: "Display and touch",
    body: "We test touch across the whole screen, colour accuracy and True Tone before a phone leaves the bench.",
    image: "/images/editorial/technician.webp",
    position: "50% 45%",
    fact: { value: "100%", label: "of the screen touch-tested" },
  },
  {
    title: "Cameras",
    body: "Every lens is checked for scratches, dust and focus. Stabilisation and zoom are tested in a light box.",
    image: "/images/editorial/lens.webp",
    position: "50% 50%",
    fact: { value: "12", label: "camera checks, from focus to stabilisation" },
  },
  {
    title: "Battery and logic board",
    body: "We log cycle count and true capacity, then run Face ID, speakers, microphones and every sensor through diagnostics.",
    image: "/images/editorial/internals.webp",
    position: "50% 55%",
    fact: { value: "85%+", label: "minimum battery health on pre-owned iPhone" },
  },
  {
    title: "Frame, glass and seals",
    body: "Dents, bends, back-glass cracks and water indicators. Seals are renewed whenever a phone has been opened.",
    image: "/images/editorial/workbench.webp",
    position: "40% 50%",
    fact: { value: "48", label: "points on the full inspection checklist" },
  },
];

/**
 * Scroll-pinned inspection story. The progress rail follows scroll
 * continuously; photos are stacked and cross-fade with CSS transitions so
 * nothing mounts mid-scroll.
 */
export function InsideStory() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const rail = useSpring(scrollYProgress, { stiffness: 140, damping: 32, mass: 0.3 });
  const [step, setStep] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const next = Math.min(STEPS.length - 1, Math.max(0, Math.floor(p * STEPS.length)));
    setStep((current) => (current === next ? current : next));
  });

  const current = STEPS[step];

  return (
    <section ref={ref} data-header-theme="dark" className="relative h-[320vh] bg-night text-white" aria-label="How we inspect every iPhone">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div className="shell grid w-full gap-8 pt-[var(--header-h)] lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16 lg:pt-0">
          {/* Copy and steps */}
          <div>
            <p className="eyebrow text-accent-light">Inside the workshop</p>
            <h2 className="mt-3 text-[clamp(1.75rem,3vw,2.6rem)] leading-[1.05]">
              48 checks. <span className="text-night-mute">Before any phone reaches you.</span>
            </h2>

            <ol className="relative mt-10 hidden lg:block">
              {/* Rail: a faint track with a fill that follows scroll */}
              <span aria-hidden="true" className="absolute top-4 bottom-4 left-[15px] w-px bg-night-line" />
              <motion.span aria-hidden="true" className="absolute top-4 bottom-4 left-[15px] w-px origin-top bg-white/80" style={{ scaleY: rail }} />

              {STEPS.map((s, i) => {
                const state = i < step ? "done" : i === step ? "active" : "next";
                return (
                  <li key={s.title} className="relative grid grid-cols-[32px_1fr] gap-5 py-3.5">
                    <span
                      className={cn(
                        "relative z-10 grid h-8 w-8 place-items-center rounded-full border text-[0.78rem] font-medium tabular-nums transition-colors duration-500",
                        state === "active" && "border-white bg-white text-night",
                        state === "done" && "border-white/70 bg-night text-white",
                        state === "next" && "border-night-line bg-night text-night-mute",
                      )}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className={cn("transition-opacity duration-500", state === "active" ? "opacity-100" : "opacity-45")}>
                      <p className="pt-1 font-display text-lg font-semibold tracking-[-0.02em]">{s.title}</p>
                      <p className="mt-1 max-w-md text-[0.93rem] leading-relaxed text-white/65">{s.body}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Photo and key fact */}
          <div>
            <figure className="relative aspect-[4/3] w-full overflow-hidden rounded-[24px] bg-night-3 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.8)]">
              {STEPS.map((s, i) => (
                <Image
                  key={s.image}
                  src={s.image}
                  alt={s.title}
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  style={{ objectPosition: s.position }}
                  className={cn(
                    "object-cover transition-[opacity,transform] ease-out will-change-[opacity,transform]",
                    reduce ? "duration-300" : "duration-[1600ms]",
                    i === step ? "scale-100 opacity-100" : "scale-[1.07] opacity-0",
                  )}
                />
              ))}
            </figure>

            <div className="mt-6 flex items-end justify-between gap-6 border-t border-night-line pt-5">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-baseline gap-4"
                >
                  <span className="font-display text-[2rem] leading-none font-semibold tracking-[-0.04em] tabular-nums">{current.fact.value}</span>
                  <span className="max-w-[26ch] text-[0.9rem] leading-snug text-white/60">{current.fact.label}</span>
                </motion.div>
              </AnimatePresence>
              <span className="shrink-0 text-[0.85rem] text-night-mute tabular-nums">
                {String(step + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
              </span>
            </div>

            {/* Small screens: current step text */}
            <div className="relative mt-5 min-h-28 lg:hidden">
              {STEPS.map((s, i) => (
                <div
                  key={s.title}
                  className={cn("absolute inset-0 transition-opacity duration-500", i === step ? "opacity-100" : "pointer-events-none opacity-0")}
                  aria-hidden={i !== step}
                >
                  <p className="font-display text-lg font-semibold tracking-[-0.02em]">{s.title}</p>
                  <p className="mt-1.5 text-[0.93rem] leading-relaxed text-white/65">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
