import type { AttributeId, AttributeValueId, ProductMedia, ProductOption, ProductVariant } from "../types";

/**
 * Seed-data helpers. They expand compact pricing rules into the explicit
 * variant rows the storefront consumes. The admin portal will store variants
 * directly, so nothing outside `data/` should depend on these.
 */

type PriceRules = Partial<Record<AttributeId, Record<AttributeValueId, number>>>;

interface VariantPlan {
  skuPrefix: string;
  options: ProductOption[];
  basePrice: number;
  /** Price added per selected value, by attribute. */
  priceDelta?: PriceRules;
  /** Absolute price per value; replaces `basePrice` (e.g. repairs priced by model). */
  priceBy?: { attributeId: AttributeId; prices: Record<AttributeValueId, number> };
  /** Multiplier per value, applied after deltas (e.g. part grade). */
  priceFactor?: PriceRules;
  /** Show a struck-through price this much higher than the final price. */
  compareAtOffset?: number;
  /** Values that are currently out of stock. */
  soldOut?: AttributeValueId[][];
}

function cartesian(options: ProductOption[]): Record<AttributeId, AttributeValueId>[] {
  return options.reduce<Record<AttributeId, AttributeValueId>[]>(
    (combos, option) =>
      combos.flatMap((combo) =>
        option.valueIds.map((valueId) => ({ ...combo, [option.attributeId]: valueId })),
      ),
    [{}],
  );
}

/** Stable, readable stock numbers so the UI shows a realistic mix. */
function seedStock(key: string): number {
  let hash = 0;
  for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return 2 + (hash % 9);
}

export function buildVariants(plan: VariantPlan): ProductVariant[] {
  return cartesian(plan.options).map((selection) => {
    const valueIds = plan.options.map((o) => selection[o.attributeId]);
    let price = plan.priceBy
      ? (plan.priceBy.prices[selection[plan.priceBy.attributeId]] ?? plan.basePrice)
      : plan.basePrice;

    for (const [attributeId, deltas] of Object.entries(plan.priceDelta ?? {})) {
      price += deltas?.[selection[attributeId]] ?? 0;
    }
    for (const [attributeId, factors] of Object.entries(plan.priceFactor ?? {})) {
      price *= factors?.[selection[attributeId]] ?? 1;
    }
    price = Math.round(price);

    const isSoldOut = plan.soldOut?.some((combo) => combo.every((id) => valueIds.includes(id)));
    const sku = [plan.skuPrefix, ...valueIds].join("-").toUpperCase();

    return {
      id: sku.toLowerCase(),
      sku,
      selection,
      price,
      compareAtPrice: plan.compareAtOffset ? price + plan.compareAtOffset : undefined,
      stock: isSoldOut ? 0 : seedStock(sku),
    };
  });
}

export const productImage = (slug: string, key: string) => `/images/products/${slug}/${key}.webp`;

const ANGLE_ALT = ["front and back", "camera detail", "side profile"];

/**
 * Studio images per colour (`{colour}-1.webp`, `-2`, …), each matched to the
 * colour option so the gallery follows the shopper's selection.
 */
export function colorMedia(slug: string, name: string, colors: { id: string; label: string }[], angles = 1): ProductMedia[] {
  return colors.flatMap((color) =>
    Array.from({ length: angles }, (_, i) => ({
      src: productImage(slug, `${color.id}-${i + 1}`),
      alt: `${name} in ${color.label}${angles > 1 ? `, ${ANGLE_ALT[i] ?? `view ${i + 1}`}` : ""}`,
      match: { color: color.id },
    })),
  );
}

/** Numbered images (`main-1.webp`, …) shown for every selection. */
export function numberedMedia(slug: string, name: string, count: number): ProductMedia[] {
  return Array.from({ length: count }, (_, i) => ({ src: productImage(slug, `main-${i + 1}`), alt: `${name}, view ${i + 1}` }));
}
