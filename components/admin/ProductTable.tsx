import Image from "next/image";
import Link from "next/link";
import type { Category, Product } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { priceRange } from "@/lib/catalog/variants";
import { EmptyState } from "./ui";

/** One page of products. Filtering and paging happen in the API. */
export function ProductTable({ products, categories }: { products: Product[]; categories: Category[] }) {
  if (!products.length) {
    return (
      <div className="p-5">
        <EmptyState title="No products found">Try a different search or category.</EmptyState>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[0.9rem]">
        <thead className="text-[0.78rem] text-mute">
          <tr className="border-b border-line">
            <th className="px-4 py-3 font-medium">Product</th>
            <th className="hidden px-4 py-3 font-medium md:table-cell">Category</th>
            <th className="hidden px-4 py-3 font-medium lg:table-cell">Variants</th>
            <th className="hidden px-4 py-3 font-medium sm:table-cell">Stock</th>
            <th className="px-4 py-3 text-right font-medium">Price</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {products.map((p) => {
            const range = p.variants.length ? priceRange(p) : null;
            const stock = p.variants.reduce((n, v) => n + v.stock, 0);
            return (
              <tr key={p.id} className="group relative transition-colors hover:bg-paper">
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 after:absolute after:inset-0">
                    <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg" style={{ backgroundColor: p.tint }}>
                      {p.media[0] && <Image src={p.media[0].src} alt="" fill sizes="44px" className={p.kind === "service" ? "object-cover" : "object-contain p-1"} />}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-medium">{p.name}</span>
                      <span className="text-[0.8rem] text-mute">
                        <span className="md:hidden">{categories.find((c) => c.id === p.categoryId)?.name}</span>
                        <span className="hidden md:inline">{p.badge ?? (p.featured ? "Featured" : "")}</span>
                      </span>
                    </span>
                  </Link>
                </td>
                <td className="hidden px-4 py-3 text-mute md:table-cell">{categories.find((c) => c.id === p.categoryId)?.name ?? "—"}</td>
                <td className="hidden px-4 py-3 tabular-nums lg:table-cell">{p.variants.length}</td>
                <td className={cn("hidden px-4 py-3 tabular-nums sm:table-cell", p.kind !== "service" && stock === 0 && "text-warn")}>{p.kind === "service" ? "Service" : stock}</td>
                <td className="px-4 py-3 text-right text-[0.85rem] tabular-nums sm:text-[0.9rem]">
                  {range ? (
                    range.min === range.max ? (
                      formatPrice(range.min)
                    ) : (
                      <>
                        <span className="whitespace-nowrap">{formatPrice(range.min)}</span> – <span className="whitespace-nowrap">{formatPrice(range.max)}</span>
                      </>
                    )
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
