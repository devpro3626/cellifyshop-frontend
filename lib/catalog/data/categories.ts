import type { Category } from "../types";

export const categories: Category[] = [
  {
    id: "cat-iphones",
    slug: "iphones",
    name: "iPhone",
    tagline: "New and certified pre-owned",
    description:
      "Brand-new and certified pre-owned iPhones. Every device passes a 48-point inspection, is IMEI-verified and ships with a written warranty.",
    image: "/images/products/iphone-18-pro/silver-1.webp",
    imageFit: "contain",
    tint: "#EFE7DF",
    order: 1,
  },
  {
    id: "cat-repairs",
    slug: "repairs",
    name: "Repair",
    tagline: "Same-day, by certified technicians",
    description:
      "Screens, batteries, ports, cameras and back glass. Most repairs are finished in under three hours, with a quote before any work begins.",
    image: "/images/editorial/workbench.webp",
    imageFit: "cover",
    tint: "#E3E6EA",
    order: 2,
  },
  {
    id: "cat-accessories",
    slug: "accessories",
    name: "Accessories",
    tagline: "Cases, power and audio",
    description:
      "MagSafe cases, fast chargers, braided cables and audio, chosen to match the phones we sell and tested in our workshop.",
    image: "/images/products/airpods-pro-3/main-1.webp",
    imageFit: "contain",
    tint: "#E8E4DA",
    order: 3,
  },
];
