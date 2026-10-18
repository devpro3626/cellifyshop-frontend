/**
 * Store-wide settings. Everything a shop owner would change without touching
 * component code lives here (and will later move to the admin portal).
 *
 * Contact numbers and the public URL come from environment variables (see
 * `.env.example`). They are NEXT_PUBLIC_ because WhatsApp links are built in
 * the browser too; Next.js inlines them at build time, so rebuild after changing.
 */

/** Digits only, with the country code: "+44 20 7946 0000" becomes "442079460000". */
const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");

export const site = {
  name: "CellifyShop",
  tagline: "iPhones, repairs and accessories",
  description:
    "Certified iPhones, same-day repairs by expert technicians and premium accessories. Clear pricing, written warranty, one trusted store.",
  /** Public address of the store, used for product links shared on WhatsApp. */
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://cellifyshop.com").replace(/\/+$/, ""),
  currency: "AED",
  locale: "en-AE",
  contact: {
    /** Digits only, including the country code. Used for wa.me links. */
    whatsapp: whatsappNumber,
    phoneDisplay: process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY || (whatsappNumber ? `+${whatsappNumber}` : ""),
    email: "hello@cellifyshop.com",
    address: "Unit 12, Market Square",
    hours: [
      { days: "Monday – Saturday", time: "10:00 – 20:00" },
      { days: "Sunday", time: "12:00 – 18:00" },
    ],
  },
  social: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "TikTok", href: "https://tiktok.com" },
    { label: "YouTube", href: "https://youtube.com" },
  ],
} as const;

export const navigation = [
  { label: "All products", href: "/products" },
  { label: "iPhone", href: "/products/iphones" },
  { label: "Repair", href: "/products/repairs" },
  { label: "Accessories", href: "/products/accessories" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;
