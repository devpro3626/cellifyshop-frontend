import type { Attribute, Category, Product } from "../types";
import { attributes } from "./attributes";
import { categories } from "./categories";
import { accessories } from "./products/accessories";
import { iphones } from "./products/iphones";
import { repairs } from "./products/repairs";

export interface CatalogData {
  attributes: Attribute[];
  categories: Category[];
  products: Product[];
}

/** Seed prices were authored in USD; convert once to AED retail prices ending in 9. */
const toAED = (usd: number) => Math.max(9, Math.round((usd * 3.67) / 10) * 10 - 1);

/** The starting catalogue written to the store the first time the site runs. */
export function seedCatalog(): CatalogData {
  return {
    attributes,
    categories,
    products: [...iphones, ...repairs, ...accessories].map((product) => ({
      ...product,
      variants: product.variants.map((v) => ({
        ...v,
        price: toAED(v.price),
        compareAtPrice: v.compareAtPrice ? toAED(v.compareAtPrice) : undefined,
      })),
    })),
  };
}
