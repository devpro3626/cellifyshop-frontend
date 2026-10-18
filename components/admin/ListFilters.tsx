"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { cn } from "@/lib/cn";
import { inputClass } from "./ui";

interface ListFiltersProps {
  searchPlaceholder: string;
  /** Optional dropdown filter, e.g. category. */
  select?: {
    name: string;
    label: string;
    options: { value: string; label: string }[];
  };
}

/**
 * Search box and optional dropdown that update the URL (?q=…&category=…).
 * Changing a filter returns to page 1. Search waits until typing pauses.
 */
export function ListFilters({ searchPlaceholder, select }: ListFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [pending, startTransition] = useTransition();
  const firstRun = useRef(true);

  const update = (changes: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    next.delete("page");
    const search = next.toString();
    startTransition(() => router.replace(search ? `${pathname}?${search}` : pathname));
  };

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const timer = window.setTimeout(() => update({ q: query.trim() }), 350);
    return () => window.clearTimeout(timer);
    // Only react to typing; `update` reads the latest params when it runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className={cn("flex flex-col gap-3 border-b border-line p-4 transition-opacity sm:flex-row", pending && "opacity-60")}>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={searchPlaceholder} type="search" aria-label="Search" className={cn(inputClass, "sm:max-w-xs")} />
      {select && (
        <select value={params.get(select.name) ?? ""} onChange={(e) => update({ [select.name]: e.target.value })} aria-label={select.label} className={cn(inputClass, "sm:max-w-[220px]")}>
          <option value="">{select.label}</option>
          {select.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
