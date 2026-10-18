import type { Product } from "../../types";
import { buildVariants, productImage } from "../build";

const MODELS = [
  "iphone-18-pro",
  "iphone-17-pro",
  "iphone-air",
  "iphone-17",
  "iphone-17e",
  "iphone-16-pro",
  "iphone-16",
  "iphone-15-pro",
  "iphone-15",
  "iphone-14",
  "iphone-13",
  "iphone-12",
  "iphone-11",
];

/** Genuine-part price per model; premium parts are priced from these. */
type ModelPrices = Record<(typeof MODELS)[number], number>;

const GRADE_FACTOR = { genuine: 1, premium: 0.65 };

const modelOption = { attributeId: "model", valueIds: MODELS };
const gradeOption = { attributeId: "grade", valueIds: ["genuine", "premium"] };

interface RepairSeed {
  slug: string;
  name: string;
  summary: string;
  description: string;
  highlights: string[];
  turnaround: string;
  prices: ModelPrices;
  graded: boolean;
  featured: boolean;
  tint: string;
}

function repair(seed: RepairSeed): Product {
  const options = seed.graded ? [modelOption, gradeOption] : [modelOption];
  return {
    id: `prd-${seed.slug}`,
    slug: seed.slug,
    name: seed.name,
    categoryId: "cat-repairs",
    kind: "service",
    badge: "Same day",
    summary: seed.summary,
    description: seed.description,
    highlights: seed.highlights,
    specs: [
      { label: "Turnaround", value: seed.turnaround },
      { label: "Warranty", value: seed.graded ? "12 months genuine · 90 days premium" : "90 days" },
      { label: "Data", value: "Your data stays on the device. No reset required." },
      { label: "Diagnostics", value: "Free 15-minute check before any work" },
    ],
    options,
    variants: buildVariants({
      skuPrefix: `rep-${seed.slug}`,
      options,
      basePrice: 0,
      priceBy: { attributeId: "model", prices: seed.prices },
      priceFactor: seed.graded ? { grade: GRADE_FACTOR } : undefined,
    }),
    media: [{ src: productImage(seed.slug, "main"), alt: `${seed.name} at the CellifyShop workshop` }],
    tint: seed.tint,
    featured: seed.featured,
    createdAt: "2026-09-01",
    turnaround: seed.turnaround,
    warranty: seed.graded ? "Up to 12-month warranty" : "90-day warranty",
  };
}

export const repairs: Product[] = [
  repair({
    slug: "screen-replacement",
    name: "Screen Replacement",
    summary: "Cracked, flickering or unresponsive display replaced while you wait.",
    description:
      "We replace the complete display assembly, transfer your original sensors so True Tone and Face ID keep working, and calibrate the panel before handover.",
    highlights: ["True Tone and Face ID preserved", "Water-resistance seal renewed", "Panel calibrated before handover"],
    turnaround: "45–90 min",
    prices: {
      "iphone-18-pro": 379, "iphone-17e": 229, "iphone-17-pro": 329, "iphone-air": 309, "iphone-17": 279, "iphone-16-pro": 299, "iphone-16": 239,
      "iphone-15-pro": 269, "iphone-15": 209, "iphone-14": 179, "iphone-13": 159, "iphone-12": 139, "iphone-11": 99,
    },
    graded: true,
    featured: true,
    tint: "#E4E7EB",
  }),
  repair({
    slug: "battery-replacement",
    name: "Battery Replacement",
    summary: "Restore all-day battery life and full peak performance.",
    description:
      "A new high-capacity cell, fresh adhesive and a full battery-health check. We dispose of the old battery responsibly.",
    highlights: ["Back to 100% battery health", "Peak performance restored", "Old cell recycled responsibly"],
    turnaround: "30–45 min",
    prices: {
      "iphone-18-pro": 129, "iphone-17e": 99, "iphone-17-pro": 119, "iphone-air": 119, "iphone-17": 109, "iphone-16-pro": 109, "iphone-16": 99,
      "iphone-15-pro": 99, "iphone-15": 89, "iphone-14": 89, "iphone-13": 79, "iphone-12": 69, "iphone-11": 59,
    },
    graded: true,
    featured: true,
    tint: "#E7E9E4",
  }),
  repair({
    slug: "charging-port-repair",
    name: "Charging Port Repair",
    summary: "Loose cable, slow charging or no connection, fixed in under an hour.",
    description:
      "We start with a deep clean of the port, which solves most problems. If the port is damaged, we replace the full charging flex.",
    highlights: ["Free port cleaning first", "Microphone and speaker tested", "Fast-charge verified"],
    turnaround: "30–60 min",
    prices: {
      "iphone-18-pro": 109, "iphone-17e": 79, "iphone-17-pro": 99, "iphone-air": 99, "iphone-17": 89, "iphone-16-pro": 89, "iphone-16": 79,
      "iphone-15-pro": 79, "iphone-15": 69, "iphone-14": 69, "iphone-13": 59, "iphone-12": 55, "iphone-11": 49,
    },
    graded: false,
    featured: false,
    tint: "#EAE6E1",
  }),
  repair({
    slug: "back-glass-replacement",
    name: "Back Glass Replacement",
    summary: "Shattered back glass replaced with a factory-matched finish.",
    description:
      "Laser-assisted removal of the broken glass, then a colour-matched panel fitted with new adhesive. MagSafe and wireless charging are tested after the repair.",
    highlights: ["Laser-assisted removal", "Factory colour match", "Wireless charging tested"],
    turnaround: "2–3 hours",
    prices: {
      "iphone-18-pro": 219, "iphone-17e": 149, "iphone-17-pro": 199, "iphone-air": 189, "iphone-17": 169, "iphone-16-pro": 179, "iphone-16": 149,
      "iphone-15-pro": 159, "iphone-15": 129, "iphone-14": 119, "iphone-13": 109, "iphone-12": 99, "iphone-11": 89,
    },
    graded: true,
    featured: true,
    tint: "#ECE5DE",
  }),
  repair({
    slug: "camera-repair",
    name: "Camera Repair",
    summary: "Blurry photos, a cracked lens or a shaky stabiliser, made sharp again.",
    description:
      "From a cracked lens cover to a full rear-camera module, we diagnose the fault, replace only what is needed and test focus, stabilisation and every lens.",
    highlights: ["Lens cover or full module", "Focus and stabilisation tested", "Every lens checked"],
    turnaround: "1–2 hours",
    prices: {
      "iphone-18-pro": 249, "iphone-17e": 149, "iphone-17-pro": 229, "iphone-air": 179, "iphone-17": 179, "iphone-16-pro": 209, "iphone-16": 159,
      "iphone-15-pro": 189, "iphone-15": 139, "iphone-14": 129, "iphone-13": 119, "iphone-12": 99, "iphone-11": 89,
    },
    graded: true,
    featured: false,
    tint: "#E3E5E9",
  }),
  repair({
    slug: "water-damage-treatment",
    name: "Water Damage Treatment",
    summary: "Ultrasonic cleaning and board-level diagnosis after liquid exposure.",
    description:
      "Power the phone off and bring it in as soon as possible. We open the device, clean the logic board ultrasonically and report exactly what can be saved.",
    highlights: ["Ultrasonic board cleaning", "Corrosion treatment", "Full diagnostic report"],
    turnaround: "24–48 hours",
    prices: {
      "iphone-18-pro": 79, "iphone-17e": 59, "iphone-17-pro": 79, "iphone-air": 79, "iphone-17": 69, "iphone-16-pro": 69, "iphone-16": 59,
      "iphone-15-pro": 59, "iphone-15": 55, "iphone-14": 55, "iphone-13": 49, "iphone-12": 49, "iphone-11": 49,
    },
    graded: false,
    featured: false,
    tint: "#E2E8EC",
  }),
];
