"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Suspense, useEffect, useLayoutEffect, useState } from "react";
import { bag, useBag } from "@/lib/bag/store";
import { cn } from "@/lib/cn";
import { navigation, site } from "@/lib/config/site";
import { smoothScroll } from "@/lib/scroll";
import { whatsappLink } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";

/** Pages that open on a dark hero; the header starts dark there (before measuring). */
const DARK_HERO_ROUTES = new Set(["/"]);

/** Sections marked with this attribute switch the header to its dark style while under it. */
const DARK_SECTIONS = '[data-header-theme="dark"]';

export function SiteHeader() {
  return (
    <Suspense fallback={<HeaderBar pathname={null} />}>
      <RoutedHeader />
    </Suspense>
  );
}

function RoutedHeader() {
  return <HeaderBar pathname={usePathname()} />;
}

function HeaderBar({ pathname }: { pathname: string | null }) {
  const { count } = useBag();
  const [menuOpen, setMenuOpen] = useState(false);
  const [overHero, setOverHero] = useState(pathname !== null && DARK_HERO_ROUTES.has(pathname));
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      // Probe the middle of the header bar against every dark section on the page.
      const probe = 32;
      const overDark = Array.from(document.querySelectorAll(DARK_SECTIONS)).some((el) => {
        const rect = el.getBoundingClientRect();
        return rect.top <= probe && rect.bottom > probe;
      });
      setOverHero(overDark);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // Close the mobile menu whenever the page is hidden or the route changes.
  useLayoutEffect(() => () => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    smoothScroll.stop();
    return () => smoothScroll.start();
  }, [menuOpen]);

  const dark = overHero || menuOpen;
  const isActive = (href: string) =>
    pathname !== null && (href === "/products" ? pathname === href : pathname === href || pathname.startsWith(href + "/"));

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,color,box-shadow] duration-500",
          dark ? "text-white" : "text-ink",
          dark ? (scrolled && !menuOpen ? "bg-night/70 backdrop-blur-xl" : "bg-transparent") : "bg-paper/80 backdrop-blur-xl",
          !dark && scrolled && "shadow-[0_1px_0_var(--line)]",
        )}
      >
        <div className="shell flex h-[var(--header-h)] items-center justify-between gap-6">
          <Link href="/" aria-label={`${site.name} home`} className="relative z-10">
            <Logo />
          </Link>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "relative rounded-full px-4 py-2 text-[0.88rem] transition-colors",
                      dark ? "text-white/70 hover:text-white" : "text-ink/65 hover:text-ink",
                      isActive(item.href) && (dark ? "text-white" : "text-ink"),
                    )}
                  >
                    {item.label}
                    {isActive(item.href) && <span className="absolute inset-x-4 -bottom-0.5 h-px bg-accent" />}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="relative z-10 flex items-center gap-1">
            <a
              href={whatsappLink("Hi CellifyShop, I'd like some help with an iPhone.")}
              target="_blank"
              rel="noreferrer"
              className={cn(
                "mr-1 hidden h-9 items-center gap-2 rounded-full bg-whatsapp px-3.5 text-[0.82rem] font-semibold text-white transition-colors hover:bg-whatsapp-strong md:inline-flex",
              )}
            >
              <Icon name="whatsapp" size={16} /> WhatsApp
            </a>
            <Link href="/products" aria-label="Search the store" className={cn("grid h-10 w-10 place-items-center rounded-full transition-colors", dark ? "hover:bg-white/10" : "hover:bg-ink/5")}>
              <Icon name="search" />
            </Link>
            <button
              type="button"
              onClick={() => bag.setOpen(true)}
              aria-label={`Open bag, ${count} item${count === 1 ? "" : "s"}`}
              className={cn("relative grid h-10 w-10 place-items-center rounded-full transition-colors", dark ? "hover:bg-white/10" : "hover:bg-ink/5")}
            >
              <Icon name="bag" />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    className="absolute right-0.5 top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[0.65rem] font-semibold text-white tabular-nums"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <button
              type="button"
              className={cn("grid h-10 w-10 place-items-center rounded-full lg:hidden", dark ? "hover:bg-white/10" : "hover:bg-ink/5")}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <Icon name={menuOpen ? "close" : "menu"} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 flex flex-col bg-night pt-[var(--header-h)] text-white lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            <nav aria-label="Mobile" className="shell flex flex-1 flex-col justify-between pb-10 pt-6">
              <ul className="flex flex-col">
                {navigation.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="border-b border-night-line"
                  >
                    <Link href={item.href} onClick={() => setMenuOpen(false)} className="flex items-center justify-between py-4 font-display text-[1.7rem] font-semibold tracking-[-0.04em]">
                      {item.label}
                      <Icon name="arrowUpRight" size={22} className="text-night-mute" />
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="space-y-1 text-sm text-night-mute">
                <p>{site.contact.address}</p>
                <p>{site.contact.phoneDisplay}</p>
                <p>{site.contact.email}</p>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
