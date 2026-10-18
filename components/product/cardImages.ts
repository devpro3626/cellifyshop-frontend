import type { Product } from "@/lib/catalog/types";

export interface CardVariant {
  colorId?: string;
  primary: string;
  /** Shown on hover when the product has a second angle. */
  secondary?: string;
  alt: string;
}

/** The imagery a card shows for each colour: first angle, second angle on hover. */
export function cardImages(product: Product): CardVariant[] {
  const colorIds = product.options.find((o) => o.attributeId === "color")?.valueIds ?? [];
  if (!colorIds.length) {
    const [first, second] = product.media;
    return [{ primary: first.src, secondary: second?.src, alt: first.alt }];
  }

  return colorIds.map((colorId) => {
    const [first, second] = product.media.filter((m) => m.match?.color === colorId);
    const primary = first ?? product.media[0];
    return { colorId, primary: primary.src, secondary: second?.src, alt: primary.alt };
  });
}
