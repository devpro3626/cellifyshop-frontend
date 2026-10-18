import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  /** Path of the list page, e.g. "/admin/products". */
  basePath: string;
  /** Current filters, kept on every page link. */
  query?: Record<string, string | undefined>;
  noun?: string;
}

/** Page numbers to show: first, last, and a window around the current page, with gaps. */
function pageWindow(page: number, totalPages: number): (number | "gap")[] {
  const pages = new Set([1, totalPages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= totalPages));
  const sorted = [...pages].sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? (["gap", p] as const) : [p]));
}

/** Server-rendered pagination: plain links, so it works without JavaScript and keeps filters. */
export function Pagination({ page, totalPages, total, limit, basePath, query = {}, noun = "items" }: PaginationProps) {
  const href = (target: number) => {
    const params = new URLSearchParams(Object.entries(query).filter((entry): entry is [string, string] => Boolean(entry[1])));
    if (target > 1) params.set("page", String(target));
    const search = params.toString();
    return search ? `${basePath}?${search}` : basePath;
  };
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const arrow = "grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface transition-colors hover:border-ink/40";

  return (
    <nav aria-label="Pagination" className="flex flex-col items-center justify-between gap-3 border-t border-line px-4 py-3 sm:flex-row">
      <p className="text-[0.85rem] text-mute">{total === 0 ? `No ${noun}` : `Showing ${from}–${to} of ${total} ${noun}`}</p>
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          {page > 1 ? (
            <Link href={href(page - 1)} aria-label="Previous page" className={arrow}>
              <Icon name="chevronLeft" size={16} />
            </Link>
          ) : (
            <span className={cn(arrow, "pointer-events-none opacity-40")} aria-hidden="true">
              <Icon name="chevronLeft" size={16} />
            </span>
          )}
          {pageWindow(page, totalPages).map((p, i) =>
            p === "gap" ? (
              <span key={`gap-${i}`} className="px-1 text-mute" aria-hidden="true">
                …
              </span>
            ) : (
              <Link
                key={p}
                href={href(p)}
                aria-current={p === page ? "page" : undefined}
                className={cn(
                  "grid h-9 min-w-9 place-items-center rounded-lg px-2 text-[0.88rem] tabular-nums transition-colors",
                  p === page ? "bg-ink text-white" : "border border-line bg-surface hover:border-ink/40",
                )}
              >
                {p}
              </Link>
            ),
          )}
          {page < totalPages ? (
            <Link href={href(page + 1)} aria-label="Next page" className={arrow}>
              <Icon name="chevronRight" size={16} />
            </Link>
          ) : (
            <span className={cn(arrow, "pointer-events-none opacity-40")} aria-hidden="true">
              <Icon name="chevronRight" size={16} />
            </span>
          )}
        </div>
      )}
    </nav>
  );
}
