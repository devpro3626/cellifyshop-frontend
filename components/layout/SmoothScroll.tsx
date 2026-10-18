"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { smoothScroll } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger);

/**
 * Soft, inertial page scrolling on wheel and trackpad (touch keeps native
 * momentum). Driven by GSAP's ticker so scroll-linked animations share one
 * clock. Honours prefers-reduced-motion.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 0.9,
      smoothWheel: true,
      anchors: { offset: -96, duration: 1.4 },
      // Let nested scroll areas (drawer lists, horizontal shelves) scroll natively.
      prevent: (node) => node.hasAttribute("data-lenis-prevent"),
    });
    smoothScroll.attach(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      smoothScroll.attach(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
