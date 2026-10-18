"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { AttributeValue, Product } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { Price } from "@/components/ui/Price";
import { cardImages, type CardVariant } from "./cardImages";

interface ProductCardProps {
  product: Product;
  /** Colour values used by this product (resolved from the taxonomy). */
  colors: AttributeValue[];
  /** Lowest price for the current filters; defaults to the product's lowest price. */
  fromPrice: number;
  /** Optional context line, e.g. "45–90 min" for repairs. */
  meta?: string;
  size?: "md" | "lg";
  className?: string;
  priority?: boolean;
}

export function ProductCard({ product, colors, fromPrice, meta, size = "md", className, priority }: ProductCardProps) {
  const variants = useMemo(() => cardImages(product), [product]);
  const [active, setActiveState] = useState<CardVariant>(variants[0]);
  // Images stay mounted once shown so colour changes cross-fade instead of popping in.
  const [mounted, setMounted] = useState<CardVariant[]>([variants[0]]);
  const [loaded, setLoaded] = useState<Set<string>>(() => new Set([variants[0].primary]));
  const setActive = (variant: CardVariant) => {
    setActiveState(variant);
    setMounted((list) => (list.some((v) => v.primary === variant.primary) ? list : [...list, variant]));
  };
  const markLoaded = (src: string) => setLoaded((set) => (set.has(src) ? set : new Set(set).add(src)));
  const photo = product.kind === "service";
  const href = active.colorId ? `/product/${product.slug}?color=${active.colorId}` : `/product/${product.slug}`;

  return (
    <article className={cn("group/card relative flex flex-col overflow-hidden rounded-[28px] transition-shadow duration-500 hover:shadow-[0_30px_60px_-30px_rgba(11,11,13,.35)]", className)} style={{ backgroundColor: product.tint }}>
      <div className="flex items-start justify-between gap-4 p-6 pb-0 md:p-7 md:pb-0">
        <div className="min-w-0">
          {product.badge && <p className="eyebrow mb-2 text-accent-ink">{product.badge}</p>}
          <h3 className={cn("font-display font-semibold tracking-[-0.035em]", size === "lg" ? "text-[1.5rem]" : "text-[1.2rem]")}>
            <Link href={href} className="after:absolute after:inset-0 after:z-0 after:content-['']">
              {product.name}
            </Link>
          </h3>
          <p className="mt-1.5 line-clamp-2 max-w-[34ch] text-[0.9rem] leading-snug text-ink/60">{product.summary}</p>
        </div>
      </div>

      <div
        className={cn(
          "pointer-events-none relative",
          photo ? "mx-6 my-6 aspect-[4/3] overflow-hidden rounded-[20px] md:mx-7" : "mx-auto w-full",
          !photo && (size === "lg" ? "aspect-[5/4]" : "aspect-square"),
        )}
      >
        <div className="absolute inset-0 transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover/card:scale-[1.035]">
          {mounted.map((v) => {
            // Compare by image path: variant objects are rebuilt between renders.
            const current = v.primary === active.primary;
            const visible = current && loaded.has(v.primary);
            const imageClass = cn("transition-opacity duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]", photo ? "object-cover" : "object-contain p-6");
            return (
              <div key={v.primary} className="absolute inset-0" aria-hidden={!current}>
                <Image
                  src={v.primary}
                  alt={current ? v.alt : ""}
                  fill
                  preload={priority && v.primary === variants[0].primary}
                  onLoad={() => markLoaded(v.primary)}
                  sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 90vw"
                  className={cn(imageClass, visible ? "opacity-100" : "opacity-0", visible && v.secondary && "group-hover/card:opacity-0")}
                />
                {v.secondary && (
                  <Image
                    src={v.secondary}
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 90vw"
                    className={cn(imageClass, "opacity-0", visible && "group-hover/card:opacity-100")}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="pointer-events-none relative z-10 mt-auto flex items-end justify-between gap-4 p-6 pt-0 md:p-7 md:pt-0">
        <div className="space-y-3">
          {colors.length > 1 && (
            <ul className="pointer-events-auto flex flex-wrap items-center gap-1.5" aria-label="Available colours">
              {colors.map((color) => {
                const variant = variants.find((v) => v.colorId === color.id);
                const selected = variant?.colorId === active.colorId;
                return (
                  <li key={color.id}>
                    <button
                      type="button"
                      title={color.label}
                      aria-label={`Show ${color.label}`}
                      aria-pressed={selected}
                      onMouseEnter={() => variant && setActive(variant)}
                      onFocus={() => variant && setActive(variant)}
                      onClick={() => variant && setActive(variant)}
                      className={cn(
                        "relative block h-4 w-4 rounded-full ring-1 ring-black/10 ring-inset transition-transform hover:scale-125",
                        selected && "outline outline-1 outline-offset-2 outline-ink/60",
                      )}
                      style={{ backgroundColor: color.hex }}
                    />
                  </li>
                );
              })}
            </ul>
          )}
          <p className="text-[0.95rem] font-medium">
            <Price amount={fromPrice} from={product.variants.length > 1} />
            {meta && <span className="ml-2 font-normal text-ink/50">· {meta}</span>}
          </p>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-white transition-[transform,background-color] duration-500 ease-out-expo group-hover/card:bg-accent" aria-hidden="true">
          <Icon name="arrowRight" size={18} />
        </span>
      </div>
    </article>
  );
}
