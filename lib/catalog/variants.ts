import type { Attribute, AttributeValue, Product, ProductMedia, ProductVariant } from "./types";

/**
 * Pure helpers for working with product options and variants.
 * Safe to import from both server and client components.
 */

export type Selection = Record<string, string>;

export interface ResolvedOption {
  attribute: Attribute;
  values: AttributeValue[];
}

export function resolveOptions(product: Product, attributes: Attribute[]): ResolvedOption[] {
  return product.options.flatMap((option) => {
    const attribute = attributes.find((a) => a.id === option.attributeId);
    if (!attribute) return [];
    const values = option.valueIds
      .map((id) => attribute.values.find((v) => v.id === id))
      .filter((v): v is AttributeValue => Boolean(v));
    return [{ attribute, values }];
  });
}

export function priceRange(product: Product) {
  const prices = product.variants.map((v) => v.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function isInStock(product: Product) {
  return product.variants.some((v) => v.stock > 0);
}

export function findVariant(product: Product, selection: Selection): ProductVariant | undefined {
  return product.variants.find((variant) =>
    Object.entries(variant.selection).every(([attributeId, valueId]) => selection[attributeId] === valueId),
  );
}

/** First in-stock variant, falling back to the first variant. */
export function defaultSelection(product: Product): Selection {
  const variant = product.variants.find((v) => v.stock > 0) ?? product.variants[0];
  return { ...(variant?.selection ?? {}) };
}

/**
 * Whether choosing `valueId` keeps an in-stock variant reachable, given the
 * values already chosen for the *other* attributes.
 */
export function isValueAvailable(product: Product, selection: Selection, attributeId: string, valueId: string) {
  return product.variants.some(
    (variant) =>
      variant.stock > 0 &&
      variant.selection[attributeId] === valueId &&
      Object.entries(selection).every(([id, value]) => id === attributeId || variant.selection[id] === value),
  );
}

/**
 * When a value is chosen, keep the other choices if an in-stock variant
 * exists; otherwise move to the closest in-stock variant with that value.
 */
export function selectValue(product: Product, selection: Selection, attributeId: string, valueId: string): Selection {
  const next = { ...selection, [attributeId]: valueId };
  const exact = findVariant(product, next);
  if (exact && exact.stock > 0) return next;

  const fallback = product.variants
    .filter((v) => v.stock > 0 && v.selection[attributeId] === valueId)
    .sort((a, b) => sharedValues(b.selection, next) - sharedValues(a.selection, next))[0];
  return fallback ? { ...fallback.selection } : next;
}

function sharedValues(a: Selection, b: Selection) {
  return Object.keys(a).filter((key) => a[key] === b[key]).length;
}

function matches(media: ProductMedia, selection: Selection) {
  return !media.match || Object.entries(media.match).every(([id, value]) => selection[id] === value);
}

export function mediaFor(product: Product, selection: Selection): ProductMedia[] {
  const list = product.media.filter((m) => matches(m, selection));
  return list.length ? list : product.media.slice(0, 1);
}

/** Lowest in-stock price among variants that share a given value. */
export function fromPriceFor(product: Product, attributeId: string, valueId: string) {
  const prices = product.variants.filter((v) => v.selection[attributeId] === valueId).map((v) => v.price);
  return prices.length ? Math.min(...prices) : undefined;
}

export function describeSelection(product: Product, attributes: Attribute[], selection: Selection) {
  return resolveOptions(product, attributes)
    .map(({ attribute, values }) => values.find((v) => v.id === selection[attribute.id])?.label)
    .filter(Boolean)
    .join(" · ");
}

/** The values a product offers for one attribute, e.g. its colours. */
export function optionValues(product: Product, attributes: Attribute[], attributeId: string): AttributeValue[] {
  return resolveOptions(product, attributes).find((o) => o.attribute.id === attributeId)?.values ?? [];
}
