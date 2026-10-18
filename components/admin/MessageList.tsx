"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteMessage, setMessageRead } from "@/lib/admin/actions";
import type { ContactMessage } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";
import { withBusy } from "@/lib/admin/busy";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { useConfirm } from "./ConfirmDialog";
import { EmptyState, Notice } from "./ui";

const dateFormat = new Intl.DateTimeFormat("en-AE", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

/** WhatsApp link to reply to the customer directly. */
const whatsappTo = (phone: string, name: string) => `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${name}, this is CellifyShop replying to your message.`)}`;

export function MessageList({ messages }: { messages: ContactMessage[] }) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** Read state changed in this view; keeps an opened message visible until the next refresh. */
  const [readOverride, setReadOverride] = useState<Record<string, boolean>>({});
  const isRead = (m: ContactMessage) => readOverride[m.id] ?? m.read;
  const [pending, startTransition] = useTransition();
  const { confirm, dialog } = useConfirm();

  const toggleRead = (m: ContactMessage) =>
    startTransition(async () => {
      const result = await withBusy(() => setMessageRead(m.id, !isRead(m)));
      setError(result.ok ? null : result.error);
      router.refresh();
    });

  const remove = async (m: ContactMessage) => {
    const deleted = await confirm({
      title: `Delete the message from ${m.name}?`,
      description: "It will be removed from the inbox permanently.",
      confirmLabel: "Delete message",
      tone: "danger",
      action: async () => {
        const result = await withBusy(() => deleteMessage(m.id));
        return result.ok ? undefined : result.error;
      },
    });
    if (deleted) {
      setOpenId(null);
      router.refresh();
    }
  };

  const open = (message: ContactMessage) => {
    const next = openId === message.id ? null : message.id;
    setOpenId(next);
    // Opening an unread message marks it as read, saved in the background without
    // refreshing so the message stays in view (even on the Unread tab).
    if (next && !isRead(message)) {
      setReadOverride((o) => ({ ...o, [message.id]: true }));
      setMessageRead(message.id, true).then((result) => !result.ok && setError(result.error));
    }
  };

  if (!messages.length) {
    return (
      <div className="p-5">
        <EmptyState title="No messages here">Messages sent from the contact page appear in this inbox.</EmptyState>
      </div>
    );
  }

  return (
    <div className={cn("transition-opacity", pending && "opacity-70")}>
      {error && (
        <div className="p-4 pb-0">
          <Notice>{error}</Notice>
        </div>
      )}
      <ul className="divide-y divide-line">
        {messages.map((m) => {
          const expanded = openId === m.id;
          return (
            <li key={m.id} className={cn(!isRead(m) && "bg-accent-soft/40")}>
              <button type="button" onClick={() => open(m)} aria-expanded={expanded} className="grid w-full grid-cols-[12px_1fr_auto] items-start gap-3 px-4 py-4 text-left hover:bg-paper">
                <span className={cn("mt-1.5 h-2 w-2 rounded-full", isRead(m) ? "bg-transparent" : "bg-accent")} aria-label={isRead(m) ? undefined : "Unread"} />
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className={cn("text-[0.95rem]", !isRead(m) && "font-semibold")}>{m.name}</span>
                    <span className="text-[0.85rem] text-mute">{m.phone}</span>
                    <span className="rounded-full bg-paper-2 px-2 py-0.5 text-[0.72rem] text-ink/70">{m.topic}</span>
                    {m.device && <span className="text-[0.78rem] text-mute">· {m.device}</span>}
                  </span>
                  <span className={cn("mt-1 block text-[0.9rem] break-words whitespace-pre-line text-ink/75", !expanded && "line-clamp-1")}>{m.message}</span>
                </span>
                <span className="text-[0.78rem] whitespace-nowrap text-mute">{dateFormat.format(new Date(m.createdAt))}</span>
              </button>

              {expanded && (
                <div className="flex flex-wrap items-center gap-2 px-4 pb-4 sm:pl-[2.4rem]">
                  <a href={`tel:${m.phone.replace(/[^\d+]/g, "")}`} className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-[0.85rem] hover:border-ink/40">
                    <Icon name="phone" size={15} /> Call
                  </a>
                  <a
                    href={whatsappTo(m.phone, m.name)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 items-center gap-2 rounded-lg bg-whatsapp px-3 text-[0.85rem] font-medium text-white hover:bg-whatsapp-strong"
                  >
                    <Icon name="whatsapp" size={15} /> WhatsApp
                  </a>
                  {m.email && (
                    <a href={`mailto:${m.email}`} className="inline-flex h-9 max-w-full min-w-0 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-[0.85rem] hover:border-ink/40">
                      <Icon name="mail" size={15} /> <span className="truncate">{m.email}</span>
                    </a>
                  )}
                  <span className="flex-1" />
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => toggleRead(m)}
                    className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-[0.85rem] text-mute hover:bg-ink/5 hover:text-ink disabled:opacity-60"
                  >
                    {pending && <Spinner size={14} />}
                    Mark as {isRead(m) ? "unread" : "read"}
                  </button>
                  <button type="button" disabled={pending} onClick={() => remove(m)} className="h-9 rounded-lg px-3 text-[0.85rem] text-[#a1261b] hover:bg-[#fdecec] disabled:opacity-60">
                    Delete
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {dialog}
    </div>
  );
}
