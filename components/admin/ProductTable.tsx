"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Category, Product } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { priceRange } from "@/lib/catalog/variants";
import { EmptyState, inputClass } from "./ui";

export function ProductTable({ products, categories }: { products: Product[]; categories: Category[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => (!category || p.categoryId === category) && (!q || p.name.toLowerCase().includes(q) || p.slug.includes(q)));
  }, [products, query, category]);

  return (
    <div className="rounded-2xl border border-line bg-surface">
      <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products" type="search" className={cn(inputClass, "sm:max-w-xs")} />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={cn(inputClass, "sm:max-w-[200px]")}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {rows.length === 0 ? (
        <div className="p-5">
          <EmptyState title="No products found" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[0.9rem]">
            <thead className="text-[0.78rem] text-mute">
              <tr className="border-b border-line">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Variants</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 text-right font-medium">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((p) => {
                const range = p.variants.length ? priceRange(p) : null;
                const stock = p.variants.reduce((n, v) => n + v.stock, 0);
                return (
                  <tr key={p.id} className="group relative transition-colors hover:bg-paper">
                    <td className="px-4 py-3">
                      <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 after:absolute after:inset-0">
                        <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg" style={{ backgroundColor: p.tint }}>
                          {p.media[0] && <Image src={p.media[0].src} alt="" fill sizes="44px" className={p.kind === "service" ? "object-cover" : "object-contain p-1"} />}
                        </span>
                        <span>
                          <span className="block font-medium">{p.name}</span>
                          <span className="text-[0.8rem] text-mute">/{p.slug}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-mute">{categories.find((c) => c.id === p.categoryId)?.name ?? "—"}</td>
                    <td className="px-4 py-3 tabular-nums">{p.variants.length}</td>
                    <td className={cn("px-4 py-3 tabular-nums", p.kind !== "service" && stock === 0 && "text-warn")}>{p.kind === "service" ? "Service" : stock}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {range ? (range.min === range.max ? formatPrice(range.min) : `${formatPrice(range.min)} – ${formatPrice(range.max)}`) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
