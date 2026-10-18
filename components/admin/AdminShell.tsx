"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { logout } from "@/lib/admin/actions";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/ui/Icon";
import { LogoMark } from "@/components/ui/Logo";
import { ProgressBar } from "./ProgressBar";

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin", label: "Dashboard", icon: "sparkle" },
  { href: "/admin/products", label: "Products", icon: "bag" },
  { href: "/admin/categories", label: "Categories", icon: "menu" },
  { href: "/admin/taxonomy", label: "Taxonomy", icon: "check" },
  { href: "/admin/messages", label: "Messages", icon: "mail" },
];

export function AdminShell({ children, unread = 0 }: { children: ReactNode; unread?: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));

  const nav = (
    <nav className="flex flex-col gap-1" aria-label="Admin">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setOpen(false)}
          aria-current={isActive(item.href) ? "page" : undefined}
          className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-[0.92rem] transition-colors", isActive(item.href) ? "bg-ink text-white" : "text-ink/70 hover:bg-ink/5 hover:text-ink")}
        >
          <Icon name={item.icon} size={18} />
          {item.label}
          {item.href === "/admin/messages" && unread > 0 && (
            <span className={cn("ml-auto rounded-full px-1.5 py-0.5 text-[0.7rem] font-semibold tabular-nums", isActive(item.href) ? "bg-white text-ink" : "bg-accent text-white")}>{unread}</span>
          )}
        </Link>
      ))}
    </nav>
  );

  const footer = (
    <div className="mt-auto space-y-1 border-t border-line pt-4">
      <Link href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2 text-[0.9rem] text-ink/70 hover:bg-ink/5 hover:text-ink">
        <Icon name="arrowUpRight" size={18} /> View store
      </Link>
      <form action={logout}>
        <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[0.9rem] text-ink/70 hover:bg-ink/5 hover:text-ink">
          <Icon name="close" size={18} /> Sign out
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-dvh bg-[#f6f6f4] lg:grid lg:grid-cols-[240px_1fr]">
      <ProgressBar />
      <aside className="sticky top-0 hidden h-dvh flex-col gap-6 border-r border-line bg-surface p-4 lg:flex">
        <Link href="/admin" className="flex items-center gap-2.5 px-2 pt-1">
          <LogoMark className="h-6 w-6" />
          <span className="font-display text-[1.05rem] font-semibold tracking-[-0.03em]">
            CellifyShop <span className="text-mute">Admin</span>
          </span>
        </Link>
        {nav}
        {footer}
      </aside>

      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-surface px-4 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <LogoMark className="h-6 w-6" />
          <span className="font-display font-semibold tracking-[-0.03em]">Admin</span>
        </Link>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Menu" className="grid h-10 w-10 place-items-center rounded-lg hover:bg-ink/5">
          <Icon name={open ? "close" : "menu"} />
        </button>
      </div>
      {open && (
        <div className="fixed inset-x-0 top-14 z-20 flex flex-col gap-4 border-b border-line bg-surface p-4 shadow-lg lg:hidden">
          {nav}
          {footer}
        </div>
      )}

      <main>{children}</main>
    </div>
  );
}
