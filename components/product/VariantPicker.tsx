"use client";

import type { Product } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { findVariant, isValueAvailable, type ResolvedOption, type Selection } from "@/lib/catalog/variants";

interface VariantPickerProps {
  product: Product;
  options: ResolvedOption[];
  selection: Selection;
  onSelect(attributeId: string, valueId: string): void;
}

/**
 * Renders each product option in the style its attribute asks for:
 * colour swatches, pills (with price difference) or descriptive list cards.
 */
export function VariantPicker({ product, options, selection, onSelect }: VariantPickerProps) {
  const currentPrice = findVariant(product, selection)?.price;

  /** Price difference if this value replaced the current one. */
  const delta = (attributeId: string, valueId: string) => {
    if (currentPrice === undefined) return undefined;
    const price = findVariant(product, { ...selection, [attributeId]: valueId })?.price;
    return price === undefined ? undefined : price - currentPrice;
  };

  return (
    <div className="space-y-8">
      {options.map(({ attribute, values }) => {
        const selected = values.find((v) => v.id === selection[attribute.id]);
        return (
          <fieldset key={attribute.id}>
            <legend className="mb-3 flex w-full items-baseline justify-between text-[0.95rem]">
              <span className="font-medium">{attribute.name}</span>
              {attribute.display === "swatch" && selected && <span className="text-mute">{selected.label}</span>}
            </legend>

            {attribute.display === "swatch" && (
              <div className="flex flex-wrap gap-3">
                {values.map((value) => {
                  const active = value.id === selection[attribute.id];
                  const available = isValueAvailable(product, selection, attribute.id, value.id);
                  return (
                    <button
                      key={value.id}
                      type="button"
                      aria-pressed={active}
                      aria-label={`${value.label}${available ? "" : " (limited availability)"}`}
                      title={value.label}
                      onClick={() => onSelect(attribute.id, value.id)}
                      className={cn(
                        "relative h-9 w-9 rounded-full ring-1 ring-black/10 transition-shadow duration-300 ring-inset",
                        active ? "shadow-[0_0_0_2.5px_var(--paper),0_0_0_4px_var(--ink)]" : "hover:shadow-[0_0_0_2.5px_var(--paper),0_0_0_4px_var(--line-strong)]",
                        !available && "opacity-50",
                      )}
                      style={{ backgroundColor: value.hex }}
                    />
                  );
                })}
              </div>
            )}

            {attribute.display === "pill" && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {values.map((value) => {
                  const active = value.id === selection[attribute.id];
                  const available = isValueAvailable(product, selection, attribute.id, value.id);
                  const diff = active ? undefined : delta(attribute.id, value.id);
                  return (
                    <button
                      key={value.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => onSelect(attribute.id, value.id)}
                      className={cn(
                        "flex min-h-[52px] flex-col items-start justify-center rounded-xl border px-4 py-2 text-left transition-[border-color,box-shadow]",
                        active ? "border-transparent bg-surface ring-[1.5px] ring-ink ring-inset" : "border-line bg-surface hover:border-line-strong",
                        !available && "text-mute",
                      )}
                    >
                      <span className={cn("text-[0.95rem] font-medium", !available && "line-through decoration-1")}>{value.label}</span>
                      {diff !== undefined && diff !== 0 && <span className="text-xs text-mute tabular-nums">{diff > 0 ? `+ ${formatPrice(diff)}` : `− ${formatPrice(-diff)}`}</span>}
                    </button>
                  );
                })}
              </div>
            )}

            {attribute.display === "list" && (
              <div className="space-y-2">
                {values.map((value) => {
                  const active = value.id === selection[attribute.id];
                  const available = isValueAvailable(product, selection, attribute.id, value.id);
                  const price = findVariant(product, { ...selection, [attribute.id]: value.id })?.price;
                  return (
                    <button
                      key={value.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => onSelect(attribute.id, value.id)}
                      className={cn(
                        "flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-3.5 text-left transition-[border-color,box-shadow]",
                        active ? "border-transparent bg-surface ring-[1.5px] ring-ink ring-inset" : "border-line bg-surface hover:border-line-strong",
                      )}
                    >
                      <span>
                        <span className={cn("block font-medium", !available && "text-mute line-through decoration-1")}>{value.label}</span>
                        {value.hint && <span className="mt-0.5 block text-[0.82rem] text-mute">{value.hint}</span>}
                      </span>
                      {price !== undefined && <span className="shrink-0 text-[0.95rem] font-medium tabular-nums">{formatPrice(price)}</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </fieldset>
        );
      })}
    </div>
  );
}
