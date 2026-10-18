"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";

type RevealProps = HTMLMotionProps<"div"> & { delay?: number; y?: number; as?: "div" | "li" };

/** Fades and lifts content into view once, as it enters the viewport. */
export function Reveal({ delay = 0, y = 28, as = "div", children, ...props }: RevealProps) {
  const reduce = useReducedMotion();
  const animation = {
    initial: reduce ? false : { opacity: 0, y },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "0px 0px -12% 0px" },
    transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] as const },
  };
  if (as === "li") {
    return (
      <motion.li {...animation} {...(props as HTMLMotionProps<"li">)}>
        {children}
      </motion.li>
    );
  }
  return (
    <motion.div {...animation} {...props}>
      {children}
    </motion.div>
  );
}

/** Splits a heading into words that rise out of a mask, staggered. */
export function RevealWords({ text, className, delay = 0, as: Tag = "span" }: { text: string; className?: string; delay?: number; as?: "span" | "h1" | "h2" }) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  const MotionTag = motion[Tag];
  return (
    <MotionTag className={className} initial="hidden" whileInView="show" viewport={{ once: true, margin: "0px 0px -10% 0px" }} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-top" aria-hidden="true">
          <motion.span
            className="inline-block"
            variants={{ hidden: reduce ? {} : { y: "105%" }, show: { y: 0 } }}
            transition={{ duration: 1, delay: delay + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
          >
            {word}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
