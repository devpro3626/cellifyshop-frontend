"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Attribute, Category, Product } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";
import { smoothScroll } from "@/lib/scroll";
import { optionValues, priceRange } from "@/lib/catalog/variants";
import { ProductCard } from "@/components/product/ProductCard";
import { Icon } from "@/components/ui/Icon";

interface AllProductsProps {
  categories: Category[];
  products: Product[];
  attributes: Attribute[];
}

/** Every product, grouped by category, with search and a jump bar. */
export function AllProducts({ categories, products, attributes }: AllProductsProps) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(categories[0]?.slug ?? "");
  const barRef = useRef<HTMLDivElement>(null);
  /** While a jump is animating, scroll tracking pauses so the tapped tab stays selected. */
  const lockUntil = useRef(0);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories
      .map((category) => ({
        category,
        items: products.filter((p) => p.categoryId === category.id && (!q || `${p.name} ${p.summary} ${category.name}`.toLowerCase().includes(q))),
      }))
      .filter((g) => g.items.length > 0);
  }, [categories, products, query]);

  // Highlight the last category whose section has reached the jump bar.
  useEffect(() => {
    const update = () => {
      if (performance.now() < lockUntil.current || !groups.length) return;
      const line = (barRef.current?.getBoundingClientRect().bottom ?? 0) + 48;
      const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
      let current = groups[0].category.slug;
      for (const g of groups) {
        const el = document.getElementById(`category-${g.category.slug}`);
        if (el && el.getBoundingClientRect().top <= line) current = g.category.slug;
      }
      setActive(atBottom ? groups[groups.length - 1].category.slug : current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [groups]);

  const total = groups.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <div>
      <div ref={barRef} className="sticky top-[var(--header-h)] z-20 -mx-4 border-b border-line bg-paper/90 px-4 py-3 backdrop-blur-md md:mx-0 md:px-0">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <nav aria-label="Jump to category" className="no-scrollbar flex gap-2 overflow-x-auto">
            {categories.map((c) => {
              const count = groups.find((g) => g.category.id === c.id)?.items.length ?? 0;
              return (
                <button
                  key={c.id}
                  type="button"
                  disabled={!count}
                  aria-pressed={active === c.slug}
                  onClick={() => {
                    setActive(c.slug);
                    lockUntil.current = performance.now() + 1600;
                    // Land the section just below the sticky header and jump bar.
                    smoothScroll.to(`#category-${c.slug}`, -(64 + (barRef.current?.offsetHeight ?? 70) + 16));
                  }}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40",
                    active === c.slug ? "bg-ink text-white" : "bg-paper-2 text-ink/70 hover:text-ink",
                  )}
                >
                  {c.name} <span className="ml-1 opacity-60 tabular-nums">{count}</span>
                </button>
              );
            })}
          </nav>
          <label className="relative md:w-80">
            <span className="sr-only">Search all products</span>
            <Icon name="search" size={18} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-mute" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search all products"
              className="h-11 w-full rounded-full border border-line bg-surface pr-4 pl-11 text-[0.95rem] outline-none placeholder:text-mute focus:border-ink"
            />
          </label>
        </div>
      </div>

      {total === 0 && (
        <div className="mt-10 rounded-[28px] border border-dashed border-line-strong px-6 py-20 text-center">
          <p className="font-display text-2xl font-semibold tracking-[-0.03em]">No products match &ldquo;{query}&rdquo;.</p>
          <p className="mt-2 text-mute">Try a different word, or message us and we&rsquo;ll find it for you.</p>
        </div>
      )}

      {groups.map(({ category, items }) => (
        <section key={category.id} id={`category-${category.slug}`} className="scroll-mt-40 pt-14 md:pt-20" aria-labelledby={`heading-${category.slug}`}>
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
            <div>
              <h2 id={`heading-${category.slug}`} className="text-[clamp(1.44rem,2.3vw,1.77rem)]">
                {category.name}
                <span className="ml-3 align-middle text-base font-medium text-mute tabular-nums">{items.length}</span>
              </h2>
              <p className="mt-1 text-mute">{category.tagline}</p>
            </div>
            <Link href={`/products/${category.slug}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-ink hover:underline">
              View {category.name} <Icon name="arrowRight" size={16} />
            </Link>
          </div>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((product, i) => (
              <li key={product.id}>
                <ProductCard
                  product={product}
                  colors={optionValues(product, attributes, "color")}
                  fromPrice={priceRange(product).min}
                  meta={product.turnaround}
                  className="h-full"
                  priority={i < 3 && category.id === groups[0].category.id}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
