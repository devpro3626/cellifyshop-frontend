"use client";

import { useEffect, useRef, useState } from "react";
import type { AttributeValue, Product } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { ProductCard } from "./ProductCard";

export interface ShelfItem {
  product: Product;
  colors: AttributeValue[];
  fromPrice: number;
  meta?: string;
}

/** Horizontally scrolling row of product cards with snap points and arrows. */
export function ProductShelf({ items, label }: { items: ShelfItem[]; label: string }) {
  const track = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () => setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scrollBy = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector("li");
    el.scrollBy({ left: dir * ((card?.clientWidth ?? 360) + 16) * 2, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <ul
        ref={track}
        aria-label={label}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-6 [scroll-padding-inline:max(16px,calc((100vw-1360px)/2+40px))] [padding-inline:max(16px,calc((100vw-1360px)/2+40px))] max-md:[padding-inline:16px] max-md:[scroll-padding-inline:16px]"
      >
        {items.map((item, i) => (
          <li key={item.product.id} className="w-[82vw] shrink-0 snap-start sm:w-[400px]">
            <ProductCard product={item.product} colors={item.colors} fromPrice={item.fromPrice} meta={item.meta} className="h-full" priority={i < 2} />
          </li>
        ))}
      </ul>
      <div className="shell mt-2 flex justify-end gap-2">
        {([-1, 1] as const).map((dir) => (
          <button
            key={dir}
            type="button"
            onClick={() => scrollBy(dir)}
            disabled={dir === -1 ? edges.start : edges.end}
            aria-label={dir === -1 ? "Previous products" : "Next products"}
            className={cn("grid h-11 w-11 place-items-center rounded-full border border-line-strong bg-surface transition-[opacity,border-color] hover:border-ink disabled:opacity-30")}
          >
            <Icon name={dir === -1 ? "chevronLeft" : "chevronRight"} />
          </button>
        ))}
      </div>
    </div>
  );
}
