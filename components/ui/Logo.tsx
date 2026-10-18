import { cn } from "@/lib/cn";

/**
 * Brand mark: three offset layers, the exploded view of a phone — a nod to
 * the repair workshop behind the store.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-7 w-7", className)} aria-hidden="true">
      <rect x="9.5" y="2.5" width="14" height="22" rx="4" fill="none" stroke="currentColor" strokeOpacity=".35" strokeWidth="1.6" />
      <rect x="6.5" y="5" width="14" height="22" rx="4" fill="none" stroke="currentColor" strokeOpacity=".65" strokeWidth="1.6" />
      <rect x="3.5" y="7.5" width="14" height="22" rx="4" fill="var(--accent)" />
      <rect x="8.2" y="10.2" width="4.6" height="1.6" rx=".8" fill="#fff" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="font-display text-[1.2rem] font-semibold tracking-[-0.04em]">
        Cellify<span className="opacity-45">Shop</span>
      </span>
    </span>
  );
}
