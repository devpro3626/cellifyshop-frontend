"use client";

import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Suspense, useMemo, useState } from "react";
import { bag } from "@/lib/bag/store";
import type { Attribute, Product } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";
import { formatPrice, whatsappLink } from "@/lib/format";
import { defaultSelection, describeSelection, findVariant, mediaFor, resolveOptions, selectValue, type Selection } from "@/lib/catalog/variants";
import { Button, buttonClass } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ProductGallery } from "./ProductGallery";
import { VariantPicker } from "./VariantPicker";

interface ProductViewProps {
  product: Product;
  attributes: Attribute[];
}

/** Product page body. `?color=` (from a product card) preselects a colour. */
export function ProductView(props: ProductViewProps) {
  return (
    <Suspense fallback={<ProductViewInner {...props} />}>
      <ProductViewWithParams {...props} />
    </Suspense>
  );
}

function ProductViewWithParams(props: ProductViewProps) {
  const color = useSearchParams().get("color");
  return <ProductViewInner {...props} initialColor={color} key={color ?? "default"} />;
}

function initialSelection(product: Product, color?: string | null): Selection {
  const base = defaultSelection(product);
  return color && product.options.some((o) => o.attributeId === "color" && o.valueIds.includes(color)) ? selectValue(product, base, "color", color) : base;
}

function ProductViewInner({ product, attributes, initialColor }: ProductViewProps & { initialColor?: string | null }) {
  const [selection, setSelection] = useState<Selection>(() => initialSelection(product, initialColor));
  const [added, setAdded] = useState(false);

  const options = useMemo(() => resolveOptions(product, attributes), [product, attributes]);
  const variant = findVariant(product, selection);
  const media = mediaFor(product, selection);
  const description = describeSelection(product, attributes, selection);
  const isService = product.kind === "service";
  const inStock = Boolean(variant && variant.stock > 0);

  const addToBag = () => {
    if (!variant || !inStock) return;
    bag.add({
      id: variant.id,
      productSlug: product.slug,
      name: product.name,
      description: description || "Standard",
      image: media[0].src,
      tint: product.tint,
      price: variant.price,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  const options_ = description ? ` (${description})` : "";
  const price = variant ? formatPrice(variant.price) : "";
  const buyMessage = isService
    ? `Hi CellifyShop, I'd like to book a ${product.name}${options_}. Quoted price: ${price}. When can I come in?`
    : `Hi CellifyShop, I'd like to buy the ${product.name}${options_} for ${price}. Is it available?`;
  const questionMessage = `Hi CellifyShop, I have a question about the ${product.name}${options_}.`;

  const assurances: { icon: IconName; text: string }[] = isService
    ? [
        { icon: "clock", text: `Typical turnaround ${product.turnaround}` },
        { icon: "shield", text: product.warranty ?? "Warranty included" },
        { icon: "search", text: "Free diagnosis before any work" },
      ]
    : [
        { icon: "truck", text: "Free collection in store, delivery available" },
        { icon: "shield", text: product.warranty ?? "12-month warranty" },
        { icon: "cycle", text: "14-day returns, no questions asked" },
      ];

  return (
    <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
      <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
        <ProductGallery key={selection.color ?? "all"} media={media} tint={product.tint} fit={isService ? "cover" : "contain"} />
      </div>

      <div>
        {product.badge && <p className="eyebrow text-accent-ink">{product.badge}</p>}
        <h1 className="mt-3 text-[clamp(1.92rem,3.4vw,2.72rem)] leading-[0.98] tracking-[-0.045em]">{product.name}</h1>
        <p className="mt-4 max-w-[48ch] text-[1.05rem] leading-relaxed text-mute">{product.summary}</p>

        <div className="mt-7 flex items-end gap-3 border-b border-line pb-7">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p
              key={variant?.price ?? "na"}
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -14, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-[1.8rem] leading-none font-semibold tracking-[-0.04em] tabular-nums"
            >
              {variant ? formatPrice(variant.price) : "Unavailable"}
            </motion.p>
          </AnimatePresence>
          {variant?.compareAtPrice && <s className="pb-1 text-mute">{formatPrice(variant.compareAtPrice)}</s>}
          {isService && <span className="pb-1 text-sm text-mute">incl. parts and labour</span>}
        </div>

        {options.length > 0 && (
          <div className="mt-8">
            <VariantPicker product={product} options={options} selection={selection} onSelect={(attributeId, valueId) => setSelection((s) => selectValue(product, s, attributeId, valueId))} />
          </div>
        )}

        <p className={cn("mt-8 flex items-center gap-2 text-sm", inStock ? "text-ok" : "text-warn")} aria-live="polite">
          <span className={cn("h-2 w-2 rounded-full", inStock ? "bg-ok" : "bg-warn")} />
          {!variant
            ? "This combination isn't available."
            : isService
              ? "Available today. Walk in or book ahead."
              : inStock
                ? variant.stock <= 3
                  ? `Only ${variant.stock} left. Ready to collect today.`
                  : "In stock. Ready to collect today."
                : "Sold out in this configuration. We can source one for you."}
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <a
            href={whatsappLink(buyMessage)}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!variant}
            className={buttonClass({ size: "lg", className: cn("w-full", !variant && "pointer-events-none opacity-40", isService && "sm:col-span-2") })}
          >
            <Icon name="whatsapp" size={18} /> {isService ? "Book on WhatsApp" : inStock ? "Buy on WhatsApp" : "Request on WhatsApp"}
          </a>
          {isService ? (
            <a href={whatsappLink(questionMessage)} target="_blank" rel="noreferrer" className={buttonClass({ variant: "outline", size: "lg", className: "w-full sm:col-span-2" })}>
              Ask a technician
            </a>
          ) : (
            <Button variant="outline" size="lg" className="w-full" onClick={addToBag} disabled={!inStock}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={added ? "added" : "add"} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} className="inline-flex items-center gap-2">
                  <Icon name={added ? "check" : "bag"} size={18} />
                  {added ? "Added to bag" : "Add to bag"}
                </motion.span>
              </AnimatePresence>
            </Button>
          )}
        </div>
        <p className="mt-3 text-[0.82rem] text-mute">Tap buy to message us on WhatsApp. We confirm availability and arrange collection or delivery.</p>

        <ul className="mt-8 space-y-3 rounded-[24px] bg-paper-2 p-6">
          {assurances.map((a) => (
            <li key={a.text} className="flex items-center gap-3 text-[0.92rem]">
              <Icon name={a.icon} size={20} className="shrink-0 text-ink/70" />
              {a.text}
            </li>
          ))}
        </ul>

        {variant && <p className="mt-4 font-medium tabular-nums text-xs text-mute">SKU {variant.sku}</p>}
      </div>
    </div>
  );
}
