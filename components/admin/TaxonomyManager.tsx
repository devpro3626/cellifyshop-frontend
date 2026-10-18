"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteAttribute, saveAttribute } from "@/lib/admin/actions";
import { withBusy } from "@/lib/admin/busy";
import type { Attribute, AttributeDisplay } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { AddButton, RemoveButton } from "./ListEditors";
import { useConfirm } from "./ConfirmDialog";
import { Flash, useFlash } from "./Flash";
import { Field, inputClass } from "./ui";

const DISPLAYS: { id: AttributeDisplay; label: string; hint: string }[] = [
  { id: "swatch", label: "Colour swatches", hint: "Round colour dots" },
  { id: "pill", label: "Buttons", hint: "e.g. storage sizes" },
  {
    id: "list",
    label: "Descriptive list",
    hint: "Label with a short description",
  },
];

export function TaxonomyManager({ attributes, usage }: { attributes: Attribute[]; usage: Record<string, number> }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="grid gap-3">
      {attributes.map((attribute) => (
        <AttributeEditor
          key={attribute.id}
          attribute={attribute}
          usedBy={usage[attribute.id] ?? 0}
          open={openId === attribute.id}
          onToggle={() => setOpenId(openId === attribute.id ? null : attribute.id)}
        />
      ))}
      {creating ? (
        <AttributeEditor
          attribute={{
            id: "",
            name: "",
            display: "pill",
            values: [{ id: "", label: "" }],
          }}
          usedBy={0}
          open
          isNew
          onToggle={() => setCreating(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-line-strong p-5 text-[0.92rem] font-medium text-accent-ink transition-colors hover:bg-accent-soft"
        >
          <Icon name="plus" size={18} /> New attribute
        </button>
      )}
    </div>
  );
}

interface EditorProps {
  attribute: Attribute;
  usedBy: number;
  open: boolean;
  isNew?: boolean;
  onToggle(): void;
}

function AttributeEditor({ attribute, usedBy, open, isNew = false, onToggle }: EditorProps) {
  const router = useRouter();
  const [draft, setDraft] = useState(attribute);
  const [status, setStatus] = useFlash();
  const [pending, startTransition] = useTransition();
  const { confirm, dialog } = useConfirm();

  const updateValue = (i: number, patch: Partial<Attribute["values"][number]>) =>
    setDraft((d) => ({
      ...d,
      values: d.values.map((v, j) => (j === i ? { ...v, ...patch } : v)),
    }));

  const save = () =>
    startTransition(async () => {
      const result = await withBusy(() => saveAttribute(draft, isNew));
      if (!result.ok) return setStatus({ tone: "error", text: result.error });
      setStatus({ tone: "success", text: "Saved." });
      if (isNew) onToggle();
      router.refresh();
    });

  const remove = async () => {
    const deleted = await confirm({
      title: `Delete the “${attribute.name}” attribute?`,
      description: usedBy ? `It is used by ${usedBy} product${usedBy === 1 ? "" : "s"}; remove it from them first.` : "This cannot be undone.",
      confirmLabel: "Delete attribute",
      tone: "danger",
      action: async () => {
        const result = await withBusy(() => deleteAttribute(attribute.id));
        return result.ok ? undefined : result.error;
      },
    });
    if (deleted) router.refresh();
  };

  return (
    <section className={cn("rounded-2xl border bg-surface transition-colors", open ? "border-ink/30" : "border-line")}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-3 px-4 py-4 text-left sm:gap-4 sm:px-5">
        <span className="min-w-0 flex-1">
          <span className="block font-medium">{isNew ? "New attribute" : attribute.name}</span>
          {!isNew && (
            <span className="mt-1 flex flex-wrap items-center gap-1.5">
              {attribute.values.slice(0, 10).map((v) => (
                <span key={v.id} className="inline-flex items-center gap-1.5 rounded-full bg-paper-2 px-2 py-0.5 text-[0.75rem] text-ink/70">
                  {v.hex && <span className="h-2.5 w-2.5 rounded-full ring-1 ring-black/10" style={{ backgroundColor: v.hex }} />}
                  {v.label}
                </span>
              ))}
              {attribute.values.length > 10 && <span className="text-[0.75rem] text-mute">+{attribute.values.length - 10} more</span>}
            </span>
          )}
        </span>
        {!isNew && (
          <span className="hidden text-[0.82rem] text-mute sm:block">
            Used by {usedBy} product{usedBy === 1 ? "" : "s"}
          </span>
        )}
        <Icon name="chevronDown" size={18} className={cn("text-mute transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="grid gap-5 border-t border-line p-4 sm:p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" hint={isNew ? "e.g. Colour, Storage, Condition" : undefined}>
              <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Shown as">
              <select
                value={draft.display}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    display: e.target.value as AttributeDisplay,
                  })
                }
                className={inputClass}
              >
                {DISPLAYS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label} ({d.hint})
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div>
            <p className="mb-2 text-[0.85rem] font-medium">Values</p>
            <div className="grid gap-2">
              {draft.values.map((value, i) => (
                <div key={i} className="flex flex-wrap gap-2 sm:flex-nowrap">
                  {draft.display === "swatch" && (
                    <input
                      type="color"
                      value={value.hex ?? "#cccccc"}
                      onChange={(e) => updateValue(i, { hex: e.target.value })}
                      aria-label={`Colour for ${value.label || "value"}`}
                      className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-line bg-surface p-1"
                    />
                  )}
                  <input value={value.label} onChange={(e) => updateValue(i, { label: e.target.value })} placeholder="Label, e.g. 256GB" className={cn(inputClass, "min-w-0 flex-1")} />
                  {draft.display === "list" && (
                    <input value={value.hint ?? ""} onChange={(e) => updateValue(i, { hint: e.target.value })} placeholder="Short description" className={cn(inputClass, "min-w-0 flex-[1.4]")} />
                  )}
                  <RemoveButton
                    onClick={() =>
                      setDraft({
                        ...draft,
                        values: draft.values.filter((_, j) => j !== i),
                      })
                    }
                  />
                </div>
              ))}
            </div>
            <div className="mt-2">
              <AddButton
                onClick={() =>
                  setDraft({
                    ...draft,
                    values: [
                      ...draft.values,
                      {
                        id: "",
                        label: "",
                        ...(draft.display === "swatch" ? { hex: "#cccccc" } : {}),
                      },
                    ],
                  })
                }
              >
                Add value
              </AddButton>
            </div>
          </div>

          <Flash flash={status} onDismiss={() => setStatus(null)} />
          <div className="flex flex-wrap items-center justify-between gap-2">
            {!isNew ? (
              <Button type="button" variant="ghost" size="sm" onClick={remove} disabled={pending} className="text-[#a1261b]">
                Delete attribute
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onToggle}>
                {isNew ? "Cancel" : "Close"}
              </Button>
              <Button type="button" variant="dark" size="sm" onClick={save} loading={pending}>
                {pending ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
      {dialog}
    </section>
  );
}
