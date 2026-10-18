import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Shared building blocks for the admin portal. Plain, dense and calm. */

export const inputClass =
  "h-10 w-full rounded-lg border border-line bg-surface px-3 text-[0.92rem] outline-none transition-colors placeholder:text-mute focus:border-accent focus:ring-2 focus:ring-accent/15";

export const textareaClass =
  "w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-[0.92rem] leading-relaxed outline-none transition-colors placeholder:text-mute focus:border-accent focus:ring-2 focus:ring-accent/15";

export function AdminPage({ title, description, actions, children }: { title: string; description?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-5 sm:py-8 md:px-10 md:py-10">
      <header className="mb-6 flex flex-col gap-4 sm:mb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[1.6rem] tracking-[-0.035em] sm:text-[1.9rem]">{title}</h1>
          {description && <p className="mt-1 text-[0.95rem] text-mute">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </header>
      {children}
    </div>
  );
}

export function Card({ title, description, aside, children, className }: { title?: string; description?: string; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border border-line bg-surface", className)}>
      {(title || aside) && (
        <div className="flex items-start justify-between gap-4 border-b border-line px-4 py-4 sm:px-5">
          <div>
            {title && <h2 className="font-sans text-[0.98rem] font-semibold tracking-normal">{title}</h2>}
            {description && <p className="mt-0.5 text-[0.85rem] text-mute">{description}</p>}
          </div>
          {aside}
        </div>
      )}
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("grid gap-1.5", className)}>
      <span className="text-[0.85rem] font-medium">{label}</span>
      {children}
      {hint && <span className="text-[0.78rem] text-mute">{hint}</span>}
    </label>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange(value: boolean): void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="inline-flex items-center gap-3 text-left text-[0.9rem]">
      <span className={cn("relative h-6 w-10 shrink-0 rounded-full transition-colors", checked ? "bg-accent" : "bg-line-strong")}>
        <span className={cn("absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", checked && "translate-x-4")} />
      </span>
      {label}
    </button>
  );
}

export function Notice({ tone = "error", children }: { tone?: "error" | "success"; children: ReactNode }) {
  return (
    <p role={tone === "error" ? "alert" : "status"} className={cn("rounded-lg px-3 py-2 text-[0.88rem]", tone === "error" ? "bg-[#fdecec] text-[#a1261b]" : "bg-[#e8f5ee] text-ok")}>
      {children}
    </p>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line-strong px-6 py-14 text-center">
      <p className="font-semibold">{title}</p>
      {children && <div className="mt-2 text-[0.9rem] text-mute">{children}</div>}
    </div>
  );
}
