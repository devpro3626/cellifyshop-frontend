import { cacheLife, cacheTag } from "next/cache";
import { readCatalog } from "./store";
import type { Attribute, Category, Product, ProductQuery } from "./types";
import { priceRange } from "./variants";

/**
 * The single entry point the storefront uses to read catalogue data.
 *
 * Reads go through `use cache` tagged "catalog"; the admin portal calls
 * `updateTag("catalog")` after every change, so edits appear immediately.
 */

export const CATALOG_TAG = "catalog";

async function catalog() {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");
  return readCatalog();
}

function sortProducts(list: Product[], sort: ProductQuery["sort"] = "featured") {
  const sorted = [...list];
  switch (sort) {
    case "newest":
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "price-asc":
      return sorted.sort((a, b) => priceRange(a).min - priceRange(b).min);
    case "price-desc":
      return sorted.sort((a, b) => priceRange(b).min - priceRange(a).min);
    default:
      return sorted.sort((a, b) => Number(b.featured) - Number(a.featured));
  }
}

/** Whole catalogue (admin portal). Cached and refreshed by updateTag after edits. */
export async function getCatalog() {
  return catalog();
}

export async function getAttributes(): Promise<Attribute[]> {
  return (await catalog()).attributes;
}

export async function getCategories(): Promise<Category[]> {
  return [...(await catalog()).categories].sort((a, b) => a.order - b.order);
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  return (await getCategories()).find((c) => c.slug === slug);
}

export async function getCategoryById(id: string): Promise<Category | undefined> {
  return (await getCategories()).find((c) => c.id === id);
}

export async function getProducts(query: ProductQuery = {}): Promise<Product[]> {
  const { categories, products } = await catalog();
  const category = query.categorySlug ? categories.find((c) => c.slug === query.categorySlug) : undefined;
  if (query.categorySlug && !category) return [];

  const filtered = products.filter(
    (p) => p.variants.length > 0 && (!category || p.categoryId === category.id) && (query.featured === undefined || p.featured === query.featured),
  );
  const sorted = sortProducts(filtered, query.sort);
  return query.limit ? sorted.slice(0, query.limit) : sorted;
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  return (await catalog()).products.find((p) => p.slug === slug);
}

export async function getProductSlugs(): Promise<string[]> {
  return (await catalog()).products.map((p) => p.slug);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const { products } = await catalog();
  return products.filter((p) => p.categoryId === product.categoryId && p.id !== product.id && p.variants.length > 0).slice(0, limit);
}
