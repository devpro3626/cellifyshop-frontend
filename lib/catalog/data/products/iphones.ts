import type { Product, ProductSpec } from "../../types";
import { buildVariants, colorMedia } from "../build";
import { valuesOf } from "../lookup";

interface PhoneSeed {
  slug: string;
  name: string;
  badge: string;
  summary: string;
  description: string;
  highlights: string[];
  specs: ProductSpec[];
  colors: string[];
  /** Studio angles available per colour. */
  angles: number;
  storage: string[];
  conditions: string[];
  basePrice: number;
  storageDelta: Record<string, number>;
  conditionDelta?: Record<string, number>;
  tint: string;
  featured: boolean;
  createdAt: string;
  soldOut?: string[][];
}

const IN_THE_BOX_NEW = ["iPhone", "USB-C charge cable (1 m)", "Documentation"];
const IN_THE_BOX_PREOWNED = ["iPhone", "USB-C charge cable (1 m)", "CellifyShop inspection report", "SIM tool"];

function iphone(seed: PhoneSeed): Product {
  const options = [
    { attributeId: "color", valueIds: seed.colors },
    { attributeId: "storage", valueIds: seed.storage },
    { attributeId: "condition", valueIds: seed.conditions },
  ];
  const isNew = seed.conditions.includes("new");

  return {
    id: `prd-${seed.slug}`,
    slug: seed.slug,
    name: seed.name,
    categoryId: "cat-iphones",
    kind: "device",
    badge: seed.badge,
    summary: seed.summary,
    description: seed.description,
    highlights: seed.highlights,
    specs: seed.specs,
    inTheBox: isNew ? IN_THE_BOX_NEW : IN_THE_BOX_PREOWNED,
    options,
    variants: buildVariants({
      skuPrefix: seed.slug.replace("iphone-", "ip"),
      options,
      basePrice: seed.basePrice,
      priceDelta: { storage: seed.storageDelta, condition: seed.conditionDelta ?? {} },
      soldOut: seed.soldOut,
    }),
    media: colorMedia(seed.slug, seed.name, valuesOf("color", seed.colors), seed.angles),
    tint: seed.tint,
    featured: seed.featured,
    createdAt: seed.createdAt,
    warranty: isNew ? "12-month manufacturer warranty" : "12-month CellifyShop warranty",
  };
}

export const iphones: Product[] = [
  /* ── New ─────────────────────────────────────────────────────────── */
  iphone({
    slug: "iphone-18-pro",
    name: "iPhone 18 Pro",
    badge: "New",
    summary: "A20 Pro, a variable-aperture 48MP camera and up to 36 hours of video playback.",
    description:
      "An aluminium unibody with Ceramic Shield 2 on the front houses the A20 Pro chip. The 48MP Pro Fusion camera system adds a variable-aperture main camera and a 4x tetraprism telephoto with 8x optical-quality zoom.",
    highlights: [
      "A20 Pro chip",
      "48MP Fusion Main camera with variable aperture",
      "48MP 4x Telephoto, 8x optical-quality zoom",
      "Up to 36 hours of video playback",
    ],
    specs: [
      { label: "Display", value: "6.3″ Super Retina XDR, Always-On" },
      { label: "Chip", value: "A20 Pro" },
      { label: "Rear camera", value: "48MP Fusion Main (ƒ/1.48–ƒ/4.0) · 48MP Ultra Wide · 48MP 4x Telephoto" },
      { label: "Zoom", value: "8x optical-quality zoom in, 16x optical-quality range" },
      { label: "Front camera", value: "18MP Center Stage" },
      { label: "Battery", value: "Up to 36 hours video playback" },
      { label: "Build", value: "Aluminium unibody, Ceramic Shield 2 front, Ceramic Shield back" },
    ],
    colors: ["silver", "glacier", "burgundy", "black"],
    angles: 3,
    storage: ["256gb", "512gb", "1tb", "2tb"],
    conditions: ["new"],
    basePrice: 1199,
    storageDelta: { "512gb": 200, "1tb": 600, "2tb": 1200 },
    tint: "#EDEDEF",
    featured: true,
    createdAt: "2026-09-18",
    soldOut: [["burgundy", "2tb"]],
  }),
  iphone({
    slug: "iphone-air",
    name: "iPhone Air",
    badge: "New",
    summary: "The thinnest iPhone ever, with a titanium frame and pro-level performance.",
    description:
      "At 5.6 mm, iPhone Air pairs a polished titanium frame with Ceramic Shield on the front and back, a 6.5-inch ProMotion display and a 48MP Fusion camera.",
    highlights: ["5.6 mm titanium design", "6.5-inch ProMotion display", "A19 Pro chip", "48MP Fusion camera"],
    specs: [
      { label: "Display", value: "6.5″ Super Retina XDR, ProMotion" },
      { label: "Chip", value: "A19 Pro" },
      { label: "Rear camera", value: "48MP Fusion, 2x optical-quality Telephoto" },
      { label: "Front camera", value: "18MP Center Stage" },
      { label: "Thickness", value: "5.6 mm" },
      { label: "Build", value: "Titanium frame, Ceramic Shield front and back" },
    ],
    colors: ["sky-blue", "light-gold", "cloud-white", "space-black"],
    angles: 3,
    storage: ["256gb", "512gb", "1tb"],
    conditions: ["new"],
    basePrice: 1099,
    storageDelta: { "512gb": 200, "1tb": 600 },
    tint: "#ECEEF1",
    featured: true,
    createdAt: "2026-09-10",
  }),
  iphone({
    slug: "iphone-17",
    name: "iPhone 17",
    badge: "New",
    summary: "ProMotion, a 48MP Dual Fusion camera and the A19 chip, in five finishes.",
    description:
      "A 6.3-inch ProMotion display with Always-On, the 48MP Dual Fusion camera system and an 18MP Center Stage front camera.",
    highlights: ["6.3-inch ProMotion display", "48MP Dual Fusion camera", "A19 chip", "18MP Center Stage front camera"],
    specs: [
      { label: "Display", value: "6.3″ Super Retina XDR, ProMotion, Always-On" },
      { label: "Chip", value: "A19" },
      { label: "Rear camera", value: "48MP Fusion Main · 48MP Fusion Ultra Wide" },
      { label: "Front camera", value: "18MP Center Stage" },
      { label: "Build", value: "Aluminium, Ceramic Shield 2 front" },
      { label: "Connector", value: "USB-C" },
    ],
    colors: ["lavender", "sage", "mist-blue", "white", "black"],
    angles: 3,
    storage: ["256gb", "512gb"],
    conditions: ["new"],
    basePrice: 899,
    storageDelta: { "512gb": 200 },
    tint: "#EFEDF2",
    featured: true,
    createdAt: "2026-09-05",
  }),
  iphone({
    slug: "iphone-17e",
    name: "iPhone 17e",
    badge: "New",
    summary: "The essential iPhone. A19, a 48MP Fusion camera and all-day battery.",
    description: "iPhone 17e brings the A19 chip and a 48MP Fusion camera to a 6.1-inch OLED display, at the most accessible price in the line-up.",
    highlights: ["A19 chip", "48MP Fusion camera", "6.1-inch OLED display", "Up to 26 hours of video playback"],
    specs: [
      { label: "Display", value: "6.1″ Super Retina XDR OLED" },
      { label: "Chip", value: "A19" },
      { label: "Rear camera", value: "48MP Fusion Main, 2x optical-quality Telephoto" },
      { label: "Battery", value: "Up to 26 hours video playback" },
      { label: "Size", value: "146.7 × 71.5 × 7.80 mm" },
    ],
    colors: ["soft-pink", "white", "black"],
    angles: 2,
    storage: ["256gb", "512gb"],
    conditions: ["new"],
    basePrice: 699,
    storageDelta: { "512gb": 200 },
    tint: "#F2EDED",
    featured: false,
    createdAt: "2026-03-04",
  }),

  /* ── Certified pre-owned ─────────────────────────────────────────── */
  iphone({
    slug: "iphone-17-pro",
    name: "iPhone 17 Pro",
    badge: "Certified pre-owned",
    summary: "Forged aluminium unibody and three 48MP cameras, inspected and warranted.",
    description:
      "Every pre-owned iPhone 17 Pro passes our 48-point inspection, keeps at least 90% battery health and carries a 12-month CellifyShop warranty.",
    highlights: ["A19 Pro chip with vapour-chamber cooling", "Three 48MP Fusion cameras", "8x optical-quality zoom", "6.3-inch ProMotion display"],
    specs: [
      { label: "Display", value: "6.3″ Super Retina XDR, ProMotion" },
      { label: "Chip", value: "A19 Pro" },
      { label: "Rear camera", value: "48MP Fusion · 48MP Ultra Wide · 48MP Telephoto" },
      { label: "Front camera", value: "18MP Center Stage" },
      { label: "Build", value: "Aluminium unibody, Ceramic Shield 2" },
    ],
    colors: ["cosmic-orange", "deep-blue", "silver"],
    angles: 3,
    storage: ["256gb", "512gb", "1tb"],
    conditions: ["like-new", "excellent"],
    basePrice: 899,
    storageDelta: { "512gb": 150, "1tb": 320 },
    conditionDelta: { excellent: -70 },
    tint: "#F1EAE4",
    featured: true,
    createdAt: "2026-09-20",
    soldOut: [["deep-blue", "1tb"]],
  }),
  iphone({
    slug: "iphone-16-pro",
    name: "iPhone 16 Pro",
    badge: "Certified pre-owned",
    summary: "Grade 5 titanium, Camera Control and a 5x telephoto.",
    description: "Inspected across 48 points, fresh seals where needed and a 12-month CellifyShop warranty.",
    highlights: ["Titanium design", "A18 Pro chip", "48MP Fusion camera, 5x Telephoto", "Camera Control"],
    specs: [
      { label: "Display", value: "6.3″ Super Retina XDR, ProMotion" },
      { label: "Chip", value: "A18 Pro" },
      { label: "Rear camera", value: "48MP Fusion · 48MP Ultra Wide · 12MP 5x Telephoto" },
      { label: "Battery", value: "Up to 27 hours video playback" },
      { label: "Build", value: "Titanium, textured matte glass" },
    ],
    colors: ["desert-titanium", "natural-titanium", "white-titanium", "black-titanium"],
    angles: 1,
    storage: ["128gb", "256gb", "512gb", "1tb"],
    conditions: ["like-new", "excellent", "good"],
    basePrice: 749,
    storageDelta: { "256gb": 80, "512gb": 180, "1tb": 300 },
    conditionDelta: { excellent: -60, good: -120 },
    tint: "#EEEBE6",
    featured: false,
    createdAt: "2026-08-02",
  }),
  iphone({
    slug: "iphone-15",
    name: "iPhone 15",
    badge: "Certified pre-owned",
    summary: "Dynamic Island, a 48MP camera and USB-C at a pre-owned price.",
    description: "Colour-infused glass, Dynamic Island and a 48MP main camera. Inspected, cleaned and backed by our 12-month warranty.",
    highlights: ["Dynamic Island", "48MP Main camera", "A16 Bionic chip", "USB-C"],
    specs: [
      { label: "Display", value: "6.1″ Super Retina XDR" },
      { label: "Chip", value: "A16 Bionic" },
      { label: "Rear camera", value: "48MP Main · 12MP Ultra Wide" },
      { label: "Battery", value: "Up to 20 hours video playback" },
      { label: "Connector", value: "USB-C" },
    ],
    colors: ["pink", "yellow", "green", "blue", "black"],
    angles: 1,
    storage: ["128gb", "256gb", "512gb"],
    conditions: ["like-new", "excellent", "good"],
    basePrice: 479,
    storageDelta: { "256gb": 70, "512gb": 160 },
    conditionDelta: { excellent: -40, good: -90 },
    tint: "#F3EEEE",
    featured: false,
    createdAt: "2026-06-11",
  }),
  iphone({
    slug: "iphone-13",
    name: "iPhone 13",
    badge: "Certified pre-owned",
    summary: "Still brilliant. Dual camera, A15 Bionic and all-day battery for less.",
    description: "One of the best-value iPhones. Each unit is battery-tested to at least 85% health and fully reset.",
    highlights: ["A15 Bionic chip", "Dual 12MP camera system", "Super Retina XDR display", "Up to 19 hours video playback"],
    specs: [
      { label: "Display", value: "6.1″ Super Retina XDR" },
      { label: "Chip", value: "A15 Bionic" },
      { label: "Rear camera", value: "12MP Wide · 12MP Ultra Wide" },
      { label: "Battery", value: "Up to 19 hours video playback" },
      { label: "Connector", value: "Lightning" },
    ],
    colors: ["midnight", "starlight", "pacific-blue", "pink", "alpine-green", "red"],
    angles: 1,
    storage: ["128gb", "256gb"],
    conditions: ["like-new", "excellent", "good"],
    basePrice: 329,
    storageDelta: { "256gb": 50 },
    conditionDelta: { excellent: -30, good: -60 },
    tint: "#EBEDF0",
    featured: false,
    createdAt: "2026-05-20",
  }),
];
