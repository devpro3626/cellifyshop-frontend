import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";

export function Price({ amount, compareAt, from, className }: { amount: number; compareAt?: number; from?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-baseline gap-2 tabular-nums", className)}>
      {from && <span className="text-[0.85em] font-normal text-mute">From</span>}
      <span>{formatPrice(amount)}</span>
      {compareAt && compareAt > amount && <s className="text-[0.85em] font-normal text-mute">{formatPrice(compareAt)}</s>}
    </span>
  );
}
