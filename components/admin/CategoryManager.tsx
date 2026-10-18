"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteCategory, saveCategory } from "@/lib/admin/actions";
import { slugify } from "@/lib/admin/slug";
import type { Category } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Card, Field, inputClass, Notice, textareaClass } from "./ui";
import { UploadButton } from "./UploadButton";

const blank = (order: number): Category => ({
  id: "",
  slug: "",
  name: "",
  tagline: "",
  description: "",
  image: "",
  imageFit: "contain",
  tint: "#EEEEEF",
  order,
});

export function CategoryManager({ categories, counts }: { categories: Category[]; counts: Record<string, number> }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Category | null>(null);
  const [status, setStatus] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const open = (category: Category) => {
    setStatus(null);
    setEditing(category);
  };
  const set = <K extends keyof Category>(key: K, value: Category[K]) => setEditing((c) => (c ? { ...c, [key]: value } : c));

  const save = () =>
    editing &&
    startTransition(async () => {
      const result = await saveCategory(editing);
      if (!result.ok) return setStatus({ tone: "error", text: result.error });
      setStatus({ tone: "success", text: "Category saved." });
      setEditing(null);
      router.refresh();
    });

  const remove = (category: Category) => {
    if (!window.confirm(`Delete the “${category.name}” category?`)) return;
    startTransition(async () => {
      const result = await deleteCategory(category.id);
      setStatus(result.ok ? { tone: "success", text: "Category deleted." } : { tone: "error", text: result.error });
      if (result.ok) {
        setEditing(null);
        router.refresh();
      }
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <div className="grid content-start gap-3">
        {status && !editing && <Notice tone={status.tone}>{status.text}</Notice>}
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => open(c)}
            className={cn(
              "flex items-center gap-4 rounded-2xl border bg-surface p-3 text-left transition-colors hover:border-ink/30",
              editing?.id === c.id ? "border-ink" : "border-line",
            )}
          >
            <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl" style={{ backgroundColor: c.tint }}>
              {c.image && <Image src={c.image} alt="" fill sizes="64px" className={c.imageFit === "cover" ? "object-cover" : "object-contain p-1.5"} />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-medium">{c.name}</span>
              <span className="block truncate text-[0.85rem] text-mute">{c.tagline}</span>
            </span>
            <span className="text-[0.85rem] text-mute tabular-nums">{counts[c.id] ?? 0} products</span>
            <Icon name="chevronRight" size={18} className="text-mute" />
          </button>
        ))}
        <button
          type="button"
          onClick={() => open(blank(categories.length + 1))}
          className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-line-strong p-5 text-[0.92rem] font-medium text-accent-ink transition-colors hover:bg-accent-soft"
        >
          <Icon name="plus" size={18} /> New category
        </button>
      </div>

      {editing ? (
        <Card title={editing.id ? `Edit ${editing.name}` : "New category"} className="h-fit lg:sticky lg:top-6">
          <div className="grid gap-4">
            <Field label="Name">
              <input
                value={editing.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setEditing((c) => (c ? { ...c, name, slug: c.id ? c.slug : slugify(name) } : c));
                }}
                className={inputClass}
              />
            </Field>
            <Field label="URL slug" hint={`Shown at /products/${editing.slug || "…"}`}>
              <input value={editing.slug} onChange={(e) => set("slug", slugify(e.target.value))} className={inputClass} />
            </Field>
            <Field label="Tagline">
              <input value={editing.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="e.g. Cases, power and audio" className={inputClass} />
            </Field>
            <Field label="Description">
              <textarea rows={3} value={editing.description} onChange={(e) => set("description", e.target.value)} className={textareaClass} />
            </Field>
            <Field label="Image">
              <div className="flex items-center gap-3">
                <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-line" style={{ backgroundColor: editing.tint }}>
                  {editing.image && <Image src={editing.image} alt="" fill sizes="64px" className={editing.imageFit === "cover" ? "object-cover" : "object-contain p-1.5"} />}
                </span>
                <UploadButton onUploaded={(src) => set("image", src)} label={editing.image ? "Replace image" : "Upload image"} />
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Image style">
                <select value={editing.imageFit} onChange={(e) => set("imageFit", e.target.value as Category["imageFit"])} className={inputClass}>
                  <option value="contain">Product cut-out</option>
                  <option value="cover">Full-bleed photo</option>
                </select>
              </Field>
              <Field label="Order">
                <input type="number" value={editing.order} onChange={(e) => set("order", Number(e.target.value))} className={inputClass} />
              </Field>
            </div>
            <Field label="Background colour">
              <div className="flex gap-2">
                <input type="color" value={editing.tint} onChange={(e) => set("tint", e.target.value)} className="h-10 w-12 cursor-pointer rounded-lg border border-line bg-surface p-1" />
                <input value={editing.tint} onChange={(e) => set("tint", e.target.value)} className={inputClass} />
              </div>
            </Field>
            {status && <Notice tone={status.tone}>{status.text}</Notice>}
            <div className="flex items-center justify-between gap-2 pt-1">
              {editing.id ? (
                <Button type="button" variant="ghost" size="sm" onClick={() => remove(editing)} disabled={pending} className="text-[#a1261b]">
                  Delete
                </Button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button type="button" variant="dark" size="sm" onClick={save} disabled={pending}>
                  {pending ? "Saving…" : "Save category"}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <div className="hidden h-fit rounded-2xl border border-dashed border-line-strong p-8 text-center text-[0.9rem] text-mute lg:block">Select a category to edit it, or create a new one.</div>
      )}
    </div>
  );
}
