import type { Attribute } from "../types";

/**
 * Global product taxonomy. Products reference these ids in their `options`.
 * In the admin portal each of these becomes an editable attribute table.
 */
export const attributes: Attribute[] = [
  {
    id: "color",
    name: "Colour",
    display: "swatch",
    values: [
      // iPhone 18 Pro
      { id: "burgundy", label: "Burgundy", hex: "#6B2635" },
      { id: "glacier", label: "Glacier", hex: "#C9D6E1" },
      // iPhone 17 Pro
      { id: "cosmic-orange", label: "Cosmic Orange", hex: "#E8743B" },
      { id: "deep-blue", label: "Deep Blue", hex: "#36435E" },
      { id: "silver", label: "Silver", hex: "#E4E4E2" },
      // iPhone Air
      { id: "space-black", label: "Space Black", hex: "#262628" },
      { id: "cloud-white", label: "Cloud White", hex: "#F1F0EC" },
      { id: "light-gold", label: "Light Gold", hex: "#E9DCC2" },
      { id: "sky-blue", label: "Sky Blue", hex: "#CFDDEA" },
      // iPhone 17
      { id: "lavender", label: "Lavender", hex: "#D6C9E6" },
      { id: "sage", label: "Sage", hex: "#B7C2A2" },
      { id: "mist-blue", label: "Mist Blue", hex: "#A8BBD2" },
      { id: "white", label: "White", hex: "#F2F2F0" },
      { id: "black", label: "Black", hex: "#2C2C2E" },
      // iPhone 17e
      { id: "soft-pink", label: "Soft Pink", hex: "#F1D5D4" },
      // iPhone 16 Pro
      { id: "desert-titanium", label: "Desert Titanium", hex: "#BFA48C" },
      { id: "natural-titanium", label: "Natural Titanium", hex: "#B8B3A8" },
      { id: "white-titanium", label: "White Titanium", hex: "#EEEDE8" },
      { id: "black-titanium", label: "Black Titanium", hex: "#3B3B3C" },
      // iPhone 15
      { id: "pink", label: "Pink", hex: "#F1D3D7" },
      { id: "yellow", label: "Yellow", hex: "#F1E6B6" },
      { id: "green", label: "Green", hex: "#D0DBC4" },
      { id: "blue", label: "Blue", hex: "#CFDCE5" },
      // iPhone 13
      { id: "midnight", label: "Midnight", hex: "#232A31" },
      { id: "starlight", label: "Starlight", hex: "#F2ECE2" },
      { id: "pacific-blue", label: "Blue", hex: "#2F6283" },
      { id: "alpine-green", label: "Green", hex: "#3B4D3A" },
      { id: "red", label: "Red", hex: "#B5122F" },
      // Cases
      { id: "berry", label: "Berry", hex: "#7B2D4A" },
      { id: "olive", label: "Olive", hex: "#5F6243" },
      { id: "taupe", label: "Taupe", hex: "#8A7C6C" },
      { id: "slate-blue", label: "Slate Blue", hex: "#6F8399" },
    ],
  },
  {
    id: "storage",
    name: "Storage",
    display: "pill",
    values: [
      { id: "128gb", label: "128GB" },
      { id: "256gb", label: "256GB" },
      { id: "512gb", label: "512GB" },
      { id: "1tb", label: "1TB" },
      { id: "2tb", label: "2TB" },
    ],
  },
  {
    id: "condition",
    name: "Condition",
    display: "list",
    values: [
      { id: "new", label: "Brand new", hint: "Sealed box, full manufacturer warranty" },
      { id: "like-new", label: "Like new", hint: "No visible marks · battery 95%+" },
      { id: "excellent", label: "Excellent", hint: "Light signs of use · battery 90%+" },
      { id: "good", label: "Good", hint: "Visible wear · battery 85%+" },
    ],
  },
  {
    id: "model",
    name: "Device model",
    display: "pill",
    values: [
      { id: "iphone-18-pro-max", label: "iPhone 18 Pro Max" },
      { id: "iphone-18-pro", label: "iPhone 18 Pro" },
      { id: "iphone-17-pro", label: "iPhone 17 Pro" },
      { id: "iphone-air", label: "iPhone Air" },
      { id: "iphone-17", label: "iPhone 17" },
      { id: "iphone-17e", label: "iPhone 17e" },
      { id: "iphone-16-pro", label: "iPhone 16 Pro" },
      { id: "iphone-16", label: "iPhone 16" },
      { id: "iphone-15-pro", label: "iPhone 15 Pro" },
      { id: "iphone-15", label: "iPhone 15" },
      { id: "iphone-14", label: "iPhone 14" },
      { id: "iphone-13", label: "iPhone 13" },
      { id: "iphone-12", label: "iPhone 12" },
      { id: "iphone-11", label: "iPhone 11" },
    ],
  },
  {
    id: "grade",
    name: "Part grade",
    display: "list",
    values: [
      { id: "genuine", label: "Genuine part", hint: "Original manufacturer part · 12-month warranty" },
      { id: "premium", label: "Premium compatible", hint: "High-grade part · 90-day warranty" },
    ],
  },
  {
    id: "power",
    name: "Power",
    display: "pill",
    values: [
      { id: "20w", label: "20W" },
      { id: "40w-dynamic", label: "40W Dynamic" },
      { id: "35w-dual", label: "35W Dual" },
    ],
  },
  {
    id: "length",
    name: "Length",
    display: "pill",
    values: [
      { id: "1m", label: "1 m" },
      { id: "2m", label: "2 m" },
    ],
  },
  {
    id: "capacity",
    name: "Capacity",
    display: "pill",
    values: [
      { id: "5000mah", label: "5,000 mAh" },
      { id: "10000mah", label: "10,000 mAh" },
    ],
  },
];
