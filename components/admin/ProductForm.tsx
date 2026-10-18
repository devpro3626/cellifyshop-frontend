"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { deleteProduct, saveProduct } from "@/lib/admin/actions";
import { withBusy } from "@/lib/admin/busy";
import { slugify } from "@/lib/admin/slug";
import type { Attribute, Category, Product, ProductKind, ProductOption, ProductVariant } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useConfirm } from "./ConfirmDialog";
import { Flash, useFlash } from "./Flash";
import { AddButton, RemoveButton, SpecList, StringList } from "./ListEditors";
import { NumberInput } from "./NumberInput";
import { Card, Field, inputClass, textareaClass, Toggle } from "./ui";

interface ProductFormProps {
  initial: Product;
  categories: Category[];
  attributes: Attribute[];
  isNew: boolean;
}

const KINDS: { id: ProductKind; label: string }[] = [
  { id: "device", label: "Device (phone)" },
  { id: "accessory", label: "Accessory" },
  { id: "service", label: "Repair service" },
];

const selectionKey = (selection: Record<string, string>) =>
  Object.keys(selection)
    .sort()
    .map((k) => `${k}:${selection[k]}`)
    .join("|");

/** An image address the API accepts: a full http(s) link, or a path served by the store (/images/...). */
const isImageLink = (value: string) => /^https?:\/\/\S+$/i.test(value) || /^\/[\w\-./%]+$/.test(value);

/**
 * Every combination of the chosen option values, keeping prices already
 * entered. SKUs are previewed from the product name; the API fills any gaps.
 */
function buildVariants(options: ProductOption[], previous: ProductVariant[], defaultPrice: number, name: string): ProductVariant[] {
  const slug = slugify(name) || "item";
  const combos = options.reduce<Record<string, string>[]>((acc, o) => acc.flatMap((c) => o.valueIds.map((v) => ({ ...c, [o.attributeId]: v }))), [{}]);
  const byKey = new Map(previous.map((v) => [selectionKey(v.selection), v]));
  return combos.map((selection) => {
    const match =
      byKey.get(selectionKey(selection)) ??
      // When an option is added or removed, inherit from the closest previous variant.
      previous.find((v) => Object.entries(v.selection).every(([k, val]) => !(k in selection) || selection[k] === val));
    const suffix = options.map((o) => selection[o.attributeId]).join("-");
    const sku = `${slug}${suffix ? `-${suffix}` : ""}`.toUpperCase();
    return {
      id: sku.toLowerCase(),
      sku: byKey.get(selectionKey(selection))?.sku ?? sku,
      selection,
      price: match?.price ?? defaultPrice,
      stock: match?.stock ?? 5,
      ...(match?.compareAtPrice ? { compareAtPrice: match.compareAtPrice } : {}),
    };
  });
}

export function ProductForm({ initial, categories, attributes, isNew }: ProductFormProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<Product>(initial);
  const [defaultPrice, setDefaultPrice] = useState(initial.variants[0]?.price ?? 0);
  const [bulkStock, setBulkStock] = useState("");
  const [imageLink, setImageLink] = useState("");
  const [imageError, setImageError] = useState<string | null>(null);
  const [status, setStatus] = useFlash();
  const [pending, startTransition] = useTransition();
  const { confirm, dialog } = useConfirm();

  const set = <K extends keyof Product>(key: K, value: Product[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const colorOption = draft.options.find((o) => o.attributeId === "color");
  const colorAttribute = attributes.find((a) => a.id === "color");
  const usedAttributes = useMemo(() => draft.options.map((o) => attributes.find((a) => a.id === o.attributeId)).filter((a): a is Attribute => Boolean(a)), [draft.options, attributes]);

  const setOptions = (options: ProductOption[]) =>
    setDraft((d) => ({
      ...d,
      options,
      variants: buildVariants(options, d.variants, defaultPrice, d.name),
    }));

  const toggleValue = (attribute: Attribute, valueId: string) => {
    const current = draft.options.find((o) => o.attributeId === attribute.id)?.valueIds ?? [];
    const next = current.includes(valueId) ? current.filter((v) => v !== valueId) : [...current, valueId];
    // Keep taxonomy order for values and attributes so the storefront is consistent.
    const ordered = attribute.values.map((v) => v.id).filter((id) => next.includes(id));
    const others = draft.options.filter((o) => o.attributeId !== attribute.id);
    const options = [...others, ...(ordered.length ? [{ attributeId: attribute.id, valueIds: ordered }] : [])].sort(
      (a, b) => attributes.findIndex((x) => x.id === a.attributeId) - attributes.findIndex((x) => x.id === b.attributeId),
    );
    setOptions(options);
  };

  const updateVariant = (index: number, patch: Partial<ProductVariant>) =>
    set(
      "variants",
      draft.variants.map((v, i) => (i === index ? { ...v, ...patch } : v)),
    );

  const addImage = () => {
    const src = imageLink.trim();
    if (!isImageLink(src)) return setImageError("Paste an image link starting with https://");
    set("media", [...draft.media, { src, alt: draft.name }]);
    setImageLink("");
    setImageError(null);
  };
  const moveImage = (index: number, dir: -1 | 1) => {
    const media = [...draft.media];
    const target = index + dir;
    if (target < 0 || target >= media.length) return;
    [media[index], media[target]] = [media[target], media[index]];
    set("media", media);
  };

  const save = () =>
    startTransition(async () => {
      setStatus(null);
      const result = await withBusy(() => saveProduct(draft));
      if (!result.ok) {
        setStatus({ tone: "error", text: result.error });
        return;
      }
      setStatus({ tone: "success", text: "Saved. The store is updated." });
      if (isNew && result.data) router.replace(`/admin/products/${result.data.id}`);
      router.refresh();
    });

  const remove = async () => {
    const deleted = await confirm({
      title: `Delete “${draft.name}”?`,
      description: "It will be removed from the store straight away. This can't be undone.",
      confirmLabel: "Delete product",
      tone: "danger",
      action: async () => {
        const result = await withBusy(() => deleteProduct(draft.id));
        return result.ok ? undefined : result.error;
      },
    });
    if (deleted) {
      router.push("/admin/products");
      router.refresh();
    }
  };

  return (
    <div className="grid gap-6 pb-40 sm:pb-28">
      <Card title="Basics">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Name">
            <input value={draft.name} onChange={(e) => set("name", e.target.value)} placeholder="iPhone 18 Pro" className={inputClass} />
          </Field>
          <Field label="Category">
            <select value={draft.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={inputClass}>
              <option value="">Choose a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Type">
            <select value={draft.kind} onChange={(e) => set("kind", e.target.value as ProductKind)} className={inputClass}>
              {KINDS.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Badge" hint="Optional, e.g. New, Bestseller, Certified pre-owned">
            <input value={draft.badge ?? ""} onChange={(e) => set("badge", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Card background" hint="Soft colour behind the product image">
            <div className="flex gap-2">
              <input type="color" value={draft.tint} onChange={(e) => set("tint", e.target.value)} className="h-10 w-12 cursor-pointer rounded-lg border border-line bg-surface p-1" />
              <input value={draft.tint} onChange={(e) => set("tint", e.target.value)} className={inputClass} />
            </div>
          </Field>
          <Field label="Summary" hint="One line shown on product cards" className="md:col-span-2">
            <input value={draft.summary} onChange={(e) => set("summary", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Description" className="md:col-span-2">
            <textarea rows={4} value={draft.description} onChange={(e) => set("description", e.target.value)} className={textareaClass} />
          </Field>
          {draft.kind === "service" && (
            <Field label="Turnaround" hint="e.g. 45–90 min">
              <input value={draft.turnaround ?? ""} onChange={(e) => set("turnaround", e.target.value)} className={inputClass} />
            </Field>
          )}
          <Field label="Warranty" hint="e.g. 12-month CellifyShop warranty">
            <input value={draft.warranty ?? ""} onChange={(e) => set("warranty", e.target.value)} className={inputClass} />
          </Field>
          <div className="flex items-end md:col-span-2">
            <Toggle checked={draft.featured} onChange={(v) => set("featured", v)} label="Feature this product on the home page and at the top of lists" />
          </div>
        </div>
      </Card>

      <Card title="Images" description="Add images by link. The first one is the main image; tag images with a colour to show them when that colour is selected.">
        {draft.media.length > 0 && (
          <ul className="mb-4 grid gap-3">
            {draft.media.map((m, i) => (
              <li key={`${m.src}-${i}`} className="flex flex-wrap items-center gap-3 rounded-xl border border-line p-2.5 sm:flex-nowrap">
                <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg" style={{ backgroundColor: draft.tint }}>
                  <Image src={m.src} alt="" fill unoptimized sizes="64px" className={draft.kind === "service" ? "object-cover" : "object-contain p-1"} />
                </span>
                <input
                  value={m.alt}
                  onChange={(e) =>
                    set(
                      "media",
                      draft.media.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)),
                    )
                  }
                  placeholder="Image description"
                  className={cn(inputClass, "min-w-0 flex-1 basis-40")}
                />
                {colorOption && colorAttribute && (
                  <select
                    value={m.match?.color ?? ""}
                    onChange={(e) =>
                      set(
                        "media",
                        draft.media.map((x, j) =>
                          j === i
                            ? {
                                ...x,
                                match: e.target.value ? { color: e.target.value } : undefined,
                              }
                            : x,
                        ),
                      )
                    }
                    className={cn(inputClass, "min-w-0 flex-1 sm:w-40 sm:flex-none")}
                  >
                    <option value="">All colours</option>
                    {colorOption.valueIds.map((id) => (
                      <option key={id} value={id}>
                        {colorAttribute.values.find((v) => v.id === id)?.label ?? id}
                      </option>
                    ))}
                  </select>
                )}
                <div className="ml-auto flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveImage(i, -1)}
                    disabled={i === 0}
                    aria-label="Move up"
                    className="grid h-10 w-9 place-items-center rounded-lg border border-line disabled:opacity-30"
                  >
                    <Icon name="chevronLeft" size={16} className="rotate-90" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(i, 1)}
                    disabled={i === draft.media.length - 1}
                    aria-label="Move down"
                    className="grid h-10 w-9 place-items-center rounded-lg border border-line disabled:opacity-30"
                  >
                    <Icon name="chevronRight" size={16} className="rotate-90" />
                  </button>
                  <RemoveButton
                    onClick={() =>
                      set(
                        "media",
                        draft.media.filter((_, j) => j !== i),
                      )
                    }
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="grid gap-1.5">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={imageLink}
              onChange={(e) => setImageLink(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addImage();
                }
              }}
              placeholder="Paste an image link, e.g. https://example.com/iphone-front.webp"
              className={inputClass}
              type="url"
            />
            <Button type="button" variant="outline" size="sm" className="h-10 shrink-0 rounded-lg" onClick={addImage}>
              Add image
            </Button>
          </div>
          {imageError ? <span className="text-[0.8rem] text-[#a1261b]">{imageError}</span> : <span className="text-[0.78rem] text-mute">Use a direct link to a JPG, PNG or WebP image.</span>}
        </div>
      </Card>

      <Card title="Options and variants" description="Pick the values this product comes in. A variant is created for every combination, each with its own price and stock.">
        <div className="grid gap-5">
          {attributes.map((attribute) => {
            const selected = draft.options.find((o) => o.attributeId === attribute.id)?.valueIds ?? [];
            return (
              <div key={attribute.id}>
                <p className="mb-2 text-[0.85rem] font-medium">
                  {attribute.name} <span className="font-normal text-mute">{selected.length ? `· ${selected.length} selected` : ""}</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {attribute.values.map((value) => {
                    const on = selected.includes(value.id);
                    return (
                      <button
                        key={value.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleValue(attribute, value.id)}
                        className={cn(
                          "inline-flex h-8 items-center gap-2 rounded-full border px-3 text-[0.82rem] transition-colors",
                          on ? "border-ink bg-ink text-white" : "border-line bg-surface hover:border-ink/40",
                        )}
                      >
                        {value.hex && <span className="h-3 w-3 rounded-full ring-1 ring-black/10" style={{ backgroundColor: value.hex }} />}
                        {value.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid grid-cols-[1fr_auto] items-end gap-3 border-t border-line pt-5 sm:flex sm:flex-wrap">
          <Field label="Price for new variants (AED)">
            <NumberInput decimal value={defaultPrice} onChange={setDefaultPrice} className="sm:w-44" />
          </Field>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-10 rounded-lg"
            onClick={() =>
              set(
                "variants",
                draft.variants.map((v) => ({ ...v, price: defaultPrice })),
              )
            }
          >
            Apply to all
          </Button>
          <Field label="Stock for all">
            <input
              inputMode="numeric"
              autoComplete="off"
              value={bulkStock}
              onChange={(e) => setBulkStock(e.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, ""))}
              placeholder="e.g. 5"
              className={cn(inputClass, "tabular-nums sm:w-28")}
            />
          </Field>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-10 rounded-lg"
            onClick={() =>
              bulkStock !== "" &&
              set(
                "variants",
                draft.variants.map((v) => ({
                  ...v,
                  stock: Math.max(0, Number(bulkStock)),
                })),
              )
            }
          >
            Apply stock
          </Button>
        </div>

        {/* A table on wide screens; each variant becomes a small card on phones. */}
        <div className="mt-5 overflow-hidden rounded-xl border border-line text-[0.88rem]">
          <div className="hidden grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_9rem_7rem] gap-3 bg-paper px-3 py-2.5 text-[0.78rem] font-medium text-mute md:grid">
            <span>Variant</span>
            <span>SKU</span>
            <span>Price (AED)</span>
            <span>Stock</span>
          </div>
          <ul className="divide-y divide-line">
            {draft.variants.map((v, i) => (
              <li key={selectionKey(v.selection)} className="grid grid-cols-2 items-center gap-x-3 gap-y-2 px-3 py-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_9rem_7rem] md:py-2">
                <span className="col-span-2 font-medium md:col-span-1 md:font-normal">
                  {usedAttributes.length ? usedAttributes.map((a) => a.values.find((x) => x.id === v.selection[a.id])?.label).join(" · ") : "Single variant"}
                </span>
                <label className="col-span-2 grid gap-1 md:col-span-1">
                  <span className="text-[0.75rem] text-mute md:sr-only">SKU</span>
                  <input value={v.sku} onChange={(e) => updateVariant(i, { sku: e.target.value.toUpperCase() })} className={cn(inputClass, "h-9 font-medium")} />
                </label>
                <label className="grid gap-1">
                  <span className="text-[0.75rem] text-mute md:sr-only">Price (AED)</span>
                  <NumberInput decimal value={v.price} onChange={(price) => updateVariant(i, { price })} className="h-9" />
                </label>
                <label className="grid gap-1">
                  <span className="text-[0.75rem] text-mute md:sr-only">Stock</span>
                  <NumberInput value={v.stock} onChange={(stock) => updateVariant(i, { stock })} className="h-9" />
                </label>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-2 text-[0.8rem] text-mute">
          {draft.variants.length} variant
          {draft.variants.length === 1 ? "" : "s"}. Set stock to 0 to show a variant as sold out.
        </p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Highlights" description="Short selling points. Saved with the product; not currently shown in the store.">
          <StringList items={draft.highlights} onChange={(v) => set("highlights", v)} placeholder="e.g. A20 Pro chip" addLabel="Add highlight" />
        </Card>
        <Card title="In the box">
          <StringList items={draft.inTheBox ?? []} onChange={(v) => set("inTheBox", v)} placeholder="e.g. USB-C charge cable" addLabel="Add item" />
        </Card>
      </div>
      <Card title={draft.kind === "service" ? "Repair details" : "Tech specs"}>
        <SpecList specs={draft.specs} onChange={(v) => set("specs", v)} />
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 backdrop-blur lg:left-[240px]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-end gap-x-3 gap-y-2 px-4 py-3 sm:px-5 md:px-10">
          <Flash flash={status} onDismiss={() => setStatus(null)} className="min-w-0 basis-full sm:basis-0 sm:flex-1" />
          {!status && <span className="hidden flex-1 sm:block" />}
          {!isNew && (
            <>
              <Link href={`/product/${initial.id}`} target="_blank" className="text-[0.88rem] text-mute hover:text-ink">
                View in store
              </Link>
              <Button type="button" variant="ghost" size="sm" onClick={remove} disabled={pending} className="text-[#a1261b]">
                Delete
              </Button>
            </>
          )}
          <Button type="button" variant="dark" onClick={save} loading={pending}>
            {pending ? "Saving…" : isNew ? "Create product" : "Save changes"}
          </Button>
        </div>
      </div>
      {dialog}
      {draft.variants.length === 0 && <AddButton onClick={() => setOptions([])}>Create a single variant</AddButton>}
    </div>
  );
}
