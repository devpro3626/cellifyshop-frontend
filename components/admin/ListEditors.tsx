"use client";

import type { ProductSpec } from "@/lib/catalog/types";
import { Icon } from "@/components/ui/Icon";
import { inputClass } from "./ui";

/** Editable list of short strings (highlights, box contents). */
export function StringList({ items, onChange, placeholder, addLabel }: { items: string[]; onChange(items: string[]): void; placeholder: string; addLabel: string }) {
  return (
    <div className="grid gap-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input value={item} placeholder={placeholder} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} className={inputClass} />
          <RemoveButton onClick={() => onChange(items.filter((_, j) => j !== i))} />
        </div>
      ))}
      <AddButton onClick={() => onChange([...items, ""])}>{addLabel}</AddButton>
    </div>
  );
}

/** Editable label / value pairs (tech specs). */
export function SpecList({ specs, onChange }: { specs: ProductSpec[]; onChange(specs: ProductSpec[]): void }) {
  const update = (i: number, key: keyof ProductSpec, value: string) => onChange(specs.map((s, j) => (j === i ? { ...s, [key]: value } : s)));
  return (
    <div className="grid gap-2">
      {specs.map((spec, i) => (
        <div key={i} className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] gap-2">
          <input value={spec.label} placeholder="Label, e.g. Chip" onChange={(e) => update(i, "label", e.target.value)} className={inputClass} />
          <input value={spec.value} placeholder="Value, e.g. A20 Pro" onChange={(e) => update(i, "value", e.target.value)} className={inputClass} />
          <RemoveButton onClick={() => onChange(specs.filter((_, j) => j !== i))} />
        </div>
      ))}
      <AddButton onClick={() => onChange([...specs, { label: "", value: "" }])}>Add spec</AddButton>
    </div>
  );
}

export function RemoveButton({ onClick, label = "Remove" }: { onClick(): void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-line text-mute transition-colors hover:border-[#e5a59e] hover:text-[#a1261b]"
    >
      <Icon name="close" size={16} />
    </button>
  );
}

export function AddButton({ onClick, children }: { onClick(): void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex w-fit items-center gap-1.5 rounded-lg px-2 py-1.5 text-[0.88rem] font-medium text-accent-ink hover:bg-accent-soft">
      <Icon name="plus" size={16} /> {children}
    </button>
  );
}
