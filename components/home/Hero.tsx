"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { ButtonLink } from "@/components/ui/Button";
import { RevealWords } from "@/components/ui/Reveal";

const AmbientField = dynamic(() => import("@/components/three/AmbientField"), { ssr: false });
const MotionLink = motion.create(Link);

const FINISHES = [
  { id: "silver", label: "Silver", swatch: "#E3E4E5", light: "#a9afb4" },
  { id: "glacier", label: "Glacier", swatch: "#C9D6E1", light: "#8fb2bf" },
  { id: "burgundy", label: "Burgundy", swatch: "#6B2635", light: "#a8505f" },
  { id: "black", label: "Black", swatch: "#2E2E30", light: "#6c7074" },
] as const;

const PROOF = [
  { label: "48-point", text: "inspection on every pre-owned iPhone" },
  { label: "Same day", text: "repairs, most in under three hours" },
  { label: "12 months", text: "written warranty on devices and parts" },
];

export function Hero() {
  const [finish, setFinish] = useState<(typeof FINISHES)[number]>(FINISHES[0]);
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // Scroll: content drifts up and fades, the phone recedes.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -110]);
  const stageScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 0.85]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  // Pointer: the phone tilts toward the cursor.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateY = useSpring(useTransform(px, [-1, 1], [-9, 9]), { stiffness: 120, damping: 18 });
  const rotateX = useSpring(useTransform(py, [-1, 1], [7, -7]), { stiffness: 120, damping: 18 });
  const shadowX = useTransform(rotateY, [-9, 9], [24, -24]);

  return (
    <section
      ref={ref}
      data-header-theme="dark"
      className="relative isolate overflow-hidden bg-night text-white"
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse") return;
        px.set((e.clientX / window.innerWidth) * 2 - 1);
        py.set((e.clientY / window.innerHeight) * 2 - 1);
      }}
      onPointerLeave={() => {
        px.set(0);
        py.set(0);
      }}
    >
      <AmbientField color={finish.light} className="absolute inset-0 -z-10" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-b from-transparent to-night" />

      <div className="shell grid min-h-[100svh] items-center gap-4 pt-[calc(var(--header-h)+1.5rem)] pb-10 lg:grid-cols-[1.02fr_1fr] lg:pb-16">
        <motion.div style={{ y: contentY, opacity: fade }} className="relative z-10 order-2 lg:order-1">
          <MotionLink
            href="/product/iphone-18-pro"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="group mb-6 inline-flex items-center gap-1.5 text-[0.95rem] text-white/75 transition-colors hover:text-white"
          >
            <span className="font-semibold text-accent-light">New</span> iPhone 18 Pro is in store
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">›</span>
          </MotionLink>

          <h1 className="text-[clamp(2.24rem,3.7vw,3.67rem)] leading-[0.95] tracking-[-0.05em]">
            <RevealWords text="Brilliant phones." className="block" delay={0.15} />
            <RevealWords text="Expertly fixed." className="block text-white/40" delay={0.35} />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.7 }}
            className="mt-7 max-w-[46ch] text-base leading-relaxed text-white/65"
          >
            New and certified pre-owned iPhone, same-day repairs by certified technicians, and the accessories that complete them. One store, honest prices.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.85 }} className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="/products/iphones" variant="light" size="lg" arrow>
              Shop iPhone
            </ButtonLink>
            <ButtonLink href="/products/repairs" size="lg" variant="outline-light">
              Book a repair
            </ButtonLink>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.1 }}
            className="mt-14 grid max-w-xl grid-cols-3 gap-4 border-t border-white/10 pt-6"
          >
            {PROOF.map((item) => (
              <div key={item.label}>
                <dt className="font-display text-[1.05rem] font-semibold tracking-[-0.02em] sm:text-lg">{item.label}</dt>
                <dd className="mt-1 text-[0.78rem] leading-snug text-white/50">{item.text}</dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        <motion.div style={{ scale: stageScale }} className="relative order-1 h-[50svh] min-h-[320px] [perspective:1400px] lg:order-2 lg:h-[80svh]">
          <motion.div
            initial={{ opacity: 0, y: 60, rotateY: reduce ? 0 : -25 }}
            animate={{ opacity: 1, y: 0, rotateY: 0 }}
            transition={{ duration: 1.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <motion.div style={{ rotateX, rotateY }} className="absolute inset-0 [transform-style:preserve-3d]">
              <motion.div animate={reduce ? undefined : { y: [0, -12, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-[4%_2%_12%]">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={finish.id}
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Image
                      src={`/images/products/iphone-18-pro/${finish.id}-1.webp`}
                      alt={`iPhone 18 Pro in ${finish.label}`}
                      fill
                      preload={finish.id === FINISHES[0].id}
                      quality={90}
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,0.55)]"
                    />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </motion.div>
            <motion.div aria-hidden="true" style={{ x: shadowX }} className="absolute bottom-[7%] left-1/2 h-8 w-[46%] -translate-x-1/2 rounded-[50%] bg-black/60 blur-2xl" />
          </motion.div>

          <div className="absolute inset-x-0 bottom-0 flex justify-center">
            <div role="radiogroup" aria-label="Preview finish" className="flex items-center gap-3 rounded-full border border-white/10 bg-night-2/70 py-2 pr-4 pl-2 backdrop-blur-md">
              <div className="flex gap-1.5">
                {FINISHES.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    role="radio"
                    aria-checked={f.id === finish.id}
                    aria-label={f.label}
                    onClick={() => setFinish(f)}
                    className={cn(
                      "h-7 w-7 rounded-full ring-1 ring-white/20 transition-[transform,box-shadow] duration-300 ring-inset",
                      f.id === finish.id ? "scale-100 shadow-[0_0_0_2px_var(--night),0_0_0_3.5px_rgba(255,255,255,.85)]" : "scale-[0.82] hover:scale-90",
                    )}
                    style={{ backgroundColor: f.swatch }}
                  />
                ))}
              </div>
              <span className="min-w-[4.5rem] text-[0.82rem] text-white/75" aria-live="polite">
                {finish.label}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
