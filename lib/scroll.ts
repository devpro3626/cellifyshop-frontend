import type Lenis from "lenis";

/**
 * Shared handle to the page's smooth-scroll instance so overlays (bag drawer,
 * mobile menu) can pause it and sections can scroll programmatically.
 */
let instance: Lenis | null = null;

export const smoothScroll = {
  attach(lenis: Lenis | null) {
    instance = lenis;
  },
  /** Lock page scrolling (with or without smooth scrolling active). */
  stop() {
    if (instance) instance.stop();
    else document.documentElement.style.overflow = "hidden";
  },
  start() {
    if (instance) instance.start();
    else document.documentElement.style.overflow = "";
  },
  /** Scroll to an element or y position, smoothly when Lenis is active. */
  to(target: string | HTMLElement | number, offset = 0) {
    if (instance) {
      instance.scrollTo(target, { offset, duration: 1.4 });
      return;
    }
    const top =
      typeof target === "number"
        ? target
        : (typeof target === "string" ? document.querySelector<HTMLElement>(target) : target)?.getBoundingClientRect().top ?? 0;
    window.scrollTo({ top: typeof target === "number" ? top : top + window.scrollY + offset, behavior: "smooth" });
  },
};
