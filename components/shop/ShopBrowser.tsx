"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import type { Attribute, Product, ProductSort } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";
import { optionValues, priceRange } from "@/lib/catalog/variants";
import { ProductCard } from "@/components/product/ProductCard";
import { Icon } from "@/components/ui/Icon";

/** Attributes worth filtering by; colour is left to the product page. */
const FACET_ATTRIBUTES = ["model", "storage", "condition", "grade", "power", "length"];

const SORTS: { id: ProductSort; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "newest", label: "Newest" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
];

type Filters = Record<string, string>;

function matchingVariants(product: Product, filters: Filters) {
  return product.variants.filter((v) => Object.entries(filters).every(([attributeId, valueId]) => v.selection[attributeId] === valueId));
}

export function ShopBrowser({ products, attributes }: { products: Product[]; attributes: Attribute[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<ProductSort>("featured");
  const [filters, setFilters] = useState<Filters>({});
  const [inStockOnly, setInStockOnly] = useState(false);

  // Facets: attributes offered by at least one product in this list.
  const facets = useMemo(
    () =>
      FACET_ATTRIBUTES.flatMap((attributeId) => {
        const attribute = attributes.find((a) => a.id === attributeId);
        if (!attribute) return [];
        const used = new Set(products.flatMap((p) => p.options.filter((o) => o.attributeId === attributeId).flatMap((o) => o.valueIds)));
        const values = attribute.values.filter((v) => used.has(v.id));
        return values.length > 1 ? [{ attribute, values }] : [];
      }),
    [products, attributes],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products
      .map((product) => {
        const variants = matchingVariants(product, filters);
        const available = variants.filter((v) => v.stock > 0);
        const pool = inStockOnly ? available : variants;
        return { product, pool, fromPrice: pool.length ? Math.min(...pool.map((v) => v.price)) : priceRange(product).min };
      })
      .filter(({ product, pool }) => pool.length > 0 && (!q || `${product.name} ${product.summary}`.toLowerCase().includes(q)));

    switch (sort) {
      case "newest":
        return list.sort((a, b) => b.product.createdAt.localeCompare(a.product.createdAt));
      case "price-asc":
        return list.sort((a, b) => a.fromPrice - b.fromPrice);
      case "price-desc":
        return list.sort((a, b) => b.fromPrice - a.fromPrice);
      default:
        return list.sort((a, b) => Number(b.product.featured) - Number(a.product.featured));
    }
  }, [products, filters, query, sort, inStockOnly]);

  const activeCount = Object.keys(filters).length + (inStockOnly ? 1 : 0) + (query ? 1 : 0);
  const toggle = (attributeId: string, valueId: string) =>
    setFilters((f) => {
      const next = { ...f };
      if (next[attributeId] === valueId) delete next[attributeId];
      else next[attributeId] = valueId;
      return next;
    });

  return (
    <div>
      <div className="sticky top-[var(--header-h)] z-20 -mx-4 border-b border-line bg-paper/85 px-4 py-4 backdrop-blur-xl md:mx-0 md:rounded-b-2xl md:px-0">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search products</span>
            <Icon name="search" size={18} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-mute" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search iPhone 18 Pro, battery, AirPods…"
              className="h-12 w-full rounded-full border border-line bg-surface pr-4 pl-11 text-[0.95rem] transition-colors outline-none placeholder:text-mute focus:border-ink"
            />
          </label>
          <div className="flex items-center gap-2">
            <label className="flex h-12 cursor-pointer items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm select-none">
              <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
              In stock
            </label>
            <label className="relative">
              <span className="sr-only">Sort by</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as ProductSort)}
                className="h-12 appearance-none rounded-full border border-line bg-surface pr-10 pl-4 text-sm outline-none focus:border-ink"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <Icon name="chevronDown" size={16} className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2" />
            </label>
          </div>
        </div>

        {facets.length > 0 && (
          <div className="no-scrollbar mt-3 flex gap-6 overflow-x-auto">
            {facets.map(({ attribute, values }) => (
              <div key={attribute.id} className="flex shrink-0 items-center gap-2" role="group" aria-label={attribute.name}>
                <span className="eyebrow mr-1 text-mute">{attribute.name}</span>
                {values.map((value) => {
                  const active = filters[attribute.id] === value.id;
                  return (
                    <button
                      key={value.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggle(attribute.id, value.id)}
                      className={cn(
                        "h-8 shrink-0 rounded-full border px-3.5 text-[0.82rem] whitespace-nowrap transition-colors",
                        active ? "border-ink bg-ink text-white" : "border-line bg-surface hover:border-ink/40",
                      )}
                    >
                      {value.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between text-sm text-mute">
        <p aria-live="polite">
          {results.length} {results.length === 1 ? "result" : "results"}
        </p>
        {activeCount > 0 && (
          <button
            type="button"
            className="underline-offset-4 hover:text-ink hover:underline"
            onClick={() => {
              setFilters({});
              setQuery("");
              setInStockOnly(false);
            }}
          >
            Clear all
          </button>
        )}
      </div>

      {results.length ? (
        <motion.ul layout className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {results.map(({ product, fromPrice }, i) => (
              <motion.li
                key={product.id}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.5, delay: Math.min(i, 6) * 0.04, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProductCard
                  product={product}
                  colors={optionValues(product, attributes, "color")}
                  fromPrice={fromPrice}
                  meta={product.turnaround}
                  className="h-full"
                  priority={i < 3}
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      ) : (
        <div className="mt-6 rounded-[28px] border border-dashed border-line-strong px-6 py-20 text-center">
          <p className="font-display text-2xl font-semibold tracking-[-0.03em]">Nothing matches those filters.</p>
          <p className="mt-2 text-mute">Try removing a filter, or ask us. We can often source a model within a few days.</p>
        </div>
      )}
    </div>
  );
}
