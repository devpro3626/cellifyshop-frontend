"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { ButtonLink } from "@/components/ui/Button";
import { RevealWords } from "@/components/ui/Reveal";

const AmbientField = dynamic(() => import("@/components/three/AmbientField"), { ssr: false });
const MotionLink = motion.create(Link);

const FINISHES = [
  { id: "silver", label: "Silver", swatch: "#E3E4E5", light: "#a9afb4", smoke: "200,206,212" },
  { id: "glacier", label: "Glacier", swatch: "#C9D6E1", light: "#8fb2bf", smoke: "150,190,205" },
  { id: "burgundy", label: "Burgundy", swatch: "#6B2635", light: "#a8505f", smoke: "176,80,96" },
  { id: "black", label: "Black", swatch: "#2E2E30", light: "#6c7074", smoke: "130,134,140" },
] as const;

type Finish = (typeof FINISHES)[number];

/** How long each finish is shown before the hero moves to the next one. */
const ROTATE_MS = 3_000;

const PROOF = [
  { label: "48-point", text: "inspection on every pre-owned iPhone" },
  { label: "Same day", text: "repairs, most in under three hours" },
  { label: "12 months", text: "written warranty on devices and parts" },
];

/** Soft, slowly drifting haze behind the phone, tinted by the current finish. */
function Smoke({ finish, still }: { finish: Finish; still: boolean }) {
  const tint = (alpha: number) => `rgba(${finish.smoke},${alpha})`;
  const blob = "absolute rounded-full blur-3xl transition-[background] duration-[1200ms] ease-out";
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className={cn(blob, "inset-[18%_12%_14%]", !still && "animate-smoke-a")} style={{ background: `radial-gradient(closest-side, ${tint(0.38)}, transparent)` }} />
      <div className={cn(blob, "inset-[30%_0%_20%_38%]", !still && "animate-smoke-b")} style={{ background: `radial-gradient(closest-side, ${tint(0.22)}, transparent)` }} />
      <div className={cn(blob, "inset-[34%_42%_16%_2%]", !still && "animate-smoke-c")} style={{ background: `radial-gradient(closest-side, rgba(255,255,255,0.08), transparent)` }} />
      <div className={cn(blob, "inset-x-[8%] bottom-[2%] h-[22%]")} style={{ background: `radial-gradient(closest-side, ${tint(0.28)}, transparent)` }} />
    </div>
  );
}

export function Hero() {
  const [finish, setFinish] = useState<Finish>(FINISHES[0]);
  const [desktop, setDesktop] = useState(true);
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // Move to the next finish every ROTATE_MS. Choosing one by hand restarts the timer.
  useEffect(() => {
    if (reduce) return;
    const timer = window.setTimeout(() => {
      setFinish((current) => FINISHES[(FINISHES.findIndex((f) => f.id === current.id) + 1) % FINISHES.length]);
    }, ROTATE_MS);
    return () => window.clearTimeout(timer);
  }, [finish, reduce]);

  // The light field follows the phone: to the right on desktop, below the copy on small screens.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

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
      <AmbientField color={finish.light} focus={desktop ? [0.3, 0] : [0, -0.28]} className="absolute inset-0 -z-10" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-b from-transparent to-night" />

      <div className="shell grid items-center gap-6 pt-[calc(var(--header-h)+2.25rem)] pb-10 sm:gap-10 lg:min-h-[100svh] lg:grid-cols-[1.02fr_1fr] lg:gap-4 lg:pt-[calc(var(--header-h)+1.5rem)] lg:pb-16">
        <motion.div style={{ y: contentY, opacity: fade }} className="relative z-10 order-1 text-center lg:text-left">
          <MotionLink
            href="/products/iphones"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="group mb-4 inline-flex items-center gap-1.5 text-[0.9rem] text-white/75 transition-colors hover:text-white sm:text-[0.95rem] lg:mb-6"
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
            className="mx-auto mt-4 max-w-[34ch] text-[0.95rem] leading-relaxed text-white/65 sm:max-w-[46ch] sm:text-base lg:mx-0 lg:mt-7"
          >
            New and certified pre-owned iPhone, same-day repairs by certified technicians, and the accessories that complete them. One store, honest prices.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.85 }}
            className="mt-6 flex flex-wrap justify-center gap-3 lg:mt-9 lg:justify-start"
          >
            <ButtonLink href="/products/iphones" variant="light" size="lg" arrow className="min-w-[9.5rem] flex-1 sm:flex-none">
              Shop iPhone
            </ButtonLink>
            <ButtonLink href="/products/repairs" size="lg" variant="outline-light" className="min-w-[9.5rem] flex-1 sm:flex-none">
              Book a repair
            </ButtonLink>
          </motion.div>

          {/* Supporting facts: tablet and desktop only, to keep small screens calm */}
          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.1 }}
            className="mx-auto mt-10 hidden max-w-xl grid-cols-3 gap-4 border-t border-white/10 pt-5 text-left sm:grid lg:mx-0 lg:mt-14 lg:pt-6"
          >
            {PROOF.map((item) => (
              <div key={item.label}>
                <dt className="font-display text-lg font-semibold tracking-[-0.02em]">{item.label}</dt>
                <dd className="mt-1 text-[0.78rem] leading-snug text-white/50">{item.text}</dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        <motion.div
          style={{ scale: stageScale }}
          className="relative order-2 mx-auto aspect-[1/1.02] w-full max-w-[420px] [perspective:1400px] sm:aspect-[4/3.4] sm:max-w-[560px] lg:aspect-auto lg:h-[80svh] lg:max-w-none"
        >
          <Smoke finish={finish} still={Boolean(reduce)} />

          <motion.div
            initial={{ opacity: 0, y: 60, rotateY: reduce ? 0 : -25 }}
            animate={{ opacity: 1, y: 0, rotateY: 0 }}
            transition={{ duration: 1.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <motion.div style={{ rotateX, rotateY }} className="absolute inset-0 [transform-style:preserve-3d]">
              <motion.div
                animate={reduce ? undefined : { y: [0, -12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-[4%_2%_14%]"
              >
                {/* Every finish stays mounted and cross-fades, so switching never waits on a download. */}
                {FINISHES.map((f, i) => (
                  <Image
                    key={f.id}
                    src={`/images/products/iphone-18-pro/${f.id}-1.webp`}
                    alt={f.id === finish.id ? `iPhone 18 Pro in ${f.label}` : ""}
                    aria-hidden={f.id !== finish.id}
                    fill
                    preload={i === 0}
                    quality={90}
                    sizes="(min-width: 1024px) 50vw, 90vw"
                    className={cn(
                      "object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,0.55)] transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
                      f.id === finish.id ? "scale-100 opacity-100" : "scale-[0.97] opacity-0",
                    )}
                  />
                ))}
              </motion.div>
            </motion.div>
            <motion.div aria-hidden="true" style={{ x: shadowX }} className="absolute bottom-[9%] left-1/2 h-8 w-[46%] -translate-x-1/2 rounded-[50%] bg-black/60 blur-2xl" />
          </motion.div>

          <div className="absolute inset-x-0 bottom-0 flex justify-center">
            <div role="radiogroup" aria-label="Preview finish" className="flex items-center gap-1.5 rounded-full border border-white/10 bg-night-2/70 p-2 backdrop-blur-md">
              {FINISHES.map((f) => {
                const active = f.id === finish.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    aria-label={f.label}
                    onClick={() => setFinish(f)}
                    className="grid h-8 w-8 place-items-center"
                  >
                    <span
                      className={cn(
                        "h-6 w-6 rounded-full ring-1 ring-white/20 transition-[transform,box-shadow] duration-300 ring-inset",
                        active ? "scale-100 shadow-[0_0_0_2px_var(--night),0_0_0_3.5px_rgba(255,255,255,.85)]" : "scale-[0.8] hover:scale-90",
                      )}
                      style={{ backgroundColor: f.swatch }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
