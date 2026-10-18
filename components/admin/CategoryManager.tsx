"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { deleteCategory, saveCategory } from "@/lib/admin/actions";
import { withBusy } from "@/lib/admin/busy";
import type { Category } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useConfirm } from "./ConfirmDialog";
import { Flash, useFlash } from "./Flash";
import { NumberInput } from "./NumberInput";
import { Card, Field, inputClass, textareaClass } from "./ui";

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
  const [editing, setEditing] = useState<Category | null>(null);
  const [status, setStatus] = useFlash();
  const editorRef = useRef<HTMLDivElement>(null);
  const [pending, startTransition] = useTransition();
  const { confirm, dialog } = useConfirm();

  const open = (category: Category) => {
    setStatus(null);
    setEditing(category);
    // On phones the editor sits above the list; bring it into view.
    if (window.matchMedia("(max-width: 1023px)").matches)
      requestAnimationFrame(() =>
        editorRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        }),
      );
  };
  const set = <K extends keyof Category>(key: K, value: Category[K]) => setEditing((c) => (c ? { ...c, [key]: value } : c));

  const save = () =>
    editing &&
    startTransition(async () => {
      const result = await withBusy(() => saveCategory(editing));
      if (!result.ok) return setStatus({ tone: "error", text: result.error });
      setStatus({ tone: "success", text: "Category saved." });
      setEditing(null);
    });

  const remove = async (category: Category) => {
    const deleted = await confirm({
      title: `Delete the “${category.name}” category?`,
      description: "Only empty categories can be deleted. Move or delete its products first.",
      confirmLabel: "Delete category",
      tone: "danger",
      action: async () => {
        const result = await withBusy(() => deleteCategory(category.id));
        return result.ok ? undefined : result.error;
      },
    });
    if (deleted) {
      setStatus({ tone: "success", text: "Category deleted." });
      setEditing(null);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <div className="grid content-start gap-3">
        {!editing && <Flash flash={status} onDismiss={() => setStatus(null)} />}
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => open(c)}
            className={cn("flex items-center gap-4 rounded-2xl border bg-surface p-3 text-left transition-colors hover:border-ink/30", editing?.id === c.id ? "border-ink" : "border-line")}
          >
            <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl" style={{ backgroundColor: c.tint }}>
              {c.image && <Image src={c.image} alt="" fill sizes="64px" className={c.imageFit === "cover" ? "object-cover" : "object-contain p-1.5"} />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-medium">{c.name}</span>
              <span className="block truncate text-[0.85rem] text-mute">{c.tagline}</span>
            </span>
            <span className="shrink-0 text-[0.85rem] whitespace-nowrap text-mute tabular-nums">
              {counts[c.id] ?? 0}
              <span className="hidden sm:inline"> products</span>
            </span>
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
        <div ref={editorRef} className="order-first h-fit scroll-mt-20 lg:sticky lg:top-6 lg:order-none">
          <Card title={editing.id ? `Edit ${editing.name}` : "New category"}>
            <div className="grid gap-4">
              <Field label="Name" hint={editing.slug ? `Shown at /products/${editing.slug}` : "The web address is created from the name."}>
                <input value={editing.name} onChange={(e) => set("name", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Tagline">
                <input value={editing.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="e.g. Cases, power and audio" className={inputClass} />
              </Field>
              <Field label="Description">
                <textarea rows={3} value={editing.description} onChange={(e) => set("description", e.target.value)} className={textareaClass} />
              </Field>
              <Field label="Image link" hint="A direct link to a JPG, PNG or WebP image.">
                <div className="flex items-center gap-3">
                  <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-line" style={{ backgroundColor: editing.tint }}>
                    {/^(https?:\/\/[^\s/]+\.[^\s]+|\/\S+)$/.test(editing.image) && (
                      <Image src={editing.image} alt="" fill unoptimized sizes="40px" className={editing.imageFit === "cover" ? "object-cover" : "object-contain p-1"} />
                    )}
                  </span>
                  <input value={editing.image} onChange={(e) => set("image", e.target.value.trim())} placeholder="https://example.com/category.webp" type="url" className={inputClass} />
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
                  <NumberInput value={editing.order} onChange={(order) => set("order", order)} />
                </Field>
              </div>
              <Field label="Background colour">
                <div className="flex gap-2">
                  <input type="color" value={editing.tint} onChange={(e) => set("tint", e.target.value)} className="h-10 w-12 cursor-pointer rounded-lg border border-line bg-surface p-1" />
                  <input value={editing.tint} onChange={(e) => set("tint", e.target.value)} className={inputClass} />
                </div>
              </Field>
              <Flash flash={status} onDismiss={() => setStatus(null)} />
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
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
                  <Button type="button" variant="dark" size="sm" onClick={save} loading={pending}>
                    {pending ? "Saving…" : "Save category"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="hidden h-fit rounded-2xl border border-dashed border-line-strong p-8 text-center text-[0.9rem] text-mute lg:block">Select a category to edit it, or create a new one.</div>
      )}
      {dialog}
    </div>
  );
}
