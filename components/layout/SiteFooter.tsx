import Link from "next/link";
import { site } from "@/lib/config/site";
import { LogoMark } from "@/components/ui/Logo";
import { NewsletterForm } from "./NewsletterForm";

const columns = [
  {
    title: "Shop",
    links: [
      { label: "All products", href: "/products" },
      { label: "iPhone", href: "/products/iphones" },
      { label: "Accessories", href: "/products/accessories" },
      { label: "iPhone 18 Pro", href: "/product/iphone-18-pro" },
    ],
  },
  {
    title: "Repair",
    links: [
      { label: "All repairs", href: "/products/repairs" },
      { label: "Screen replacement", href: "/product/screen-replacement" },
      { label: "Battery replacement", href: "/product/battery-replacement" },
      { label: "Water damage", href: "/product/water-damage-treatment" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Warranty", href: "/about#warranty" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer data-header-theme="dark" className="overflow-hidden bg-night text-white">
      <div className="shell relative z-10 pt-20 pb-10">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_2fr]">
          <div className="max-w-sm">
            <p className="font-display text-[1.5rem] font-semibold leading-[1.05] tracking-[-0.04em]">Early access to new arrivals and repair offers.</p>
            <NewsletterForm />
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {columns.map((column) => (
              <div key={column.title}>
                <p className="eyebrow mb-5 text-night-mute">{column.title}</p>
                <ul className="space-y-3 text-[0.92rem]">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-white/75 transition-colors hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <p className="eyebrow mb-5 text-night-mute">Visit</p>
              <address className="space-y-3 text-[0.92rem] not-italic text-white/75">
                <p>{site.contact.address}</p>
                {site.contact.hours.map((h) => (
                  <p key={h.days}>
                    {h.days}
                    <br />
                    <span className="text-white/50">{h.time}</span>
                  </p>
                ))}
              </address>
            </div>
          </div>
        </div>

        <div className="mt-24 flex items-end gap-4 border-b border-night-line pb-8" aria-hidden="true">
          <LogoMark className="h-[8vw] max-h-28 w-auto shrink-0" />
          <p className="font-display text-[11vw] font-semibold leading-[0.8] tracking-[-0.055em] text-white xl:text-[9.5rem]">
            Cellify<span className="text-white/25">Shop</span>
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4 text-[0.8rem] text-night-mute sm:flex-row sm:items-center sm:justify-between">
          <p>© {site.name}. All rights reserved. iPhone and AirPods are trademarks of Apple Inc.</p>
          <ul className="flex gap-5">
            {site.social.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noreferrer" className="transition-colors hover:text-white">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
