import type { Metadata } from "next";
import Link from "next/link";
import { ListFilters } from "@/components/admin/ListFilters";
import { MessageList } from "@/components/admin/MessageList";
import { Pagination } from "@/components/admin/Pagination";
import { AdminPage } from "@/components/admin/ui";
import { cn } from "@/lib/cn";
import { getAdminMessages, pageParam, param } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Messages" };

const PAGE_SIZE = 15;
const STATUSES = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "read", label: "Read" },
] as const;

type Status = (typeof STATUSES)[number]["id"];

export default async function AdminMessagesPage({ searchParams }: PageProps<"/admin/messages">) {
  const sp = await searchParams;
  const status: Status = STATUSES.some((s) => s.id === param(sp.status)) ? (param(sp.status) as Status) : "all";
  const q = param(sp.q);
  const result = await getAdminMessages({
    page: pageParam(sp.page),
    limit: PAGE_SIZE,
    status,
    search: q,
  });

  return (
    <AdminPage title="Messages" description={`From the contact page. ${result.unread} unread.`}>
      <div className="rounded-2xl border border-line bg-surface">
        <div className="flex gap-1 overflow-x-auto border-b border-line px-4 pt-3">
          {STATUSES.map((s) => {
            const params = new URLSearchParams();
            if (s.id !== "all") params.set("status", s.id);
            if (q) params.set("q", q);
            const href = params.toString() ? `/admin/messages?${params}` : "/admin/messages";
            return (
              <Link
                key={s.id}
                href={href}
                aria-current={status === s.id ? "page" : undefined}
                className={cn(
                  "-mb-px shrink-0 border-b-2 px-3 pb-2.5 text-[0.9rem] whitespace-nowrap transition-colors",
                  status === s.id ? "border-ink font-medium text-ink" : "border-transparent text-mute hover:text-ink",
                )}
              >
                {s.label}
                {s.id === "unread" && result.unread > 0 && <span className="ml-1.5 rounded-full bg-accent px-1.5 py-0.5 text-[0.7rem] font-semibold text-white tabular-nums">{result.unread}</span>}
              </Link>
            );
          })}
        </div>
        <ListFilters searchPlaceholder="Search name, phone, email or message" />
        <MessageList messages={result.items} />
        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          total={result.total}
          limit={result.limit}
          basePath="/admin/messages"
          query={{ status: status === "all" ? undefined : status, q }}
          noun="messages"
        />
      </div>
    </AdminPage>
  );
}
