/**
 * Store-wide settings. Everything a shop owner would change without touching
 * component code lives here (and will later move to the admin portal).
 */
export const site = {
  name: "CellifyShop",
  tagline: "iPhones, repairs and accessories",
  description:
    "Certified iPhones, same-day repairs by expert technicians and premium accessories. Clear pricing, written warranty, one trusted store.",
  url: "https://cellifyshop.com",
  currency: "AED",
  locale: "en-AE",
  contact: {
    /** Digits only, including the country code. Used for wa.me links. */
    whatsapp: "971562361397",
    phoneDisplay: "+971 56 236 1397",
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
