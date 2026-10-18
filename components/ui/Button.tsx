import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "dark" | "light" | "outline" | "outline-light" | "ghost" | "whatsapp";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium tracking-[-0.01em] transition-[background-color,color,border-color,transform,box-shadow] duration-300 ease-out-expo active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-white hover:bg-ink-2",
  dark: "bg-ink text-white hover:bg-ink-2",
  light: "bg-white text-ink hover:bg-paper",
  outline: "border border-line-strong text-ink hover:border-ink",
  "outline-light": "border border-white/25 text-white hover:border-white hover:bg-white/5",
  ghost: "text-ink hover:bg-ink/5",
  whatsapp: "bg-whatsapp text-white hover:bg-whatsapp-strong",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.85rem]",
  md: "h-11 px-5 text-[0.92rem]",
  lg: "h-13 px-7 text-base",
};

interface Common {
  variant?: Variant;
  size?: Size;
  /** Adds a trailing arrow that nudges on hover. */
  arrow?: boolean;
  children: ReactNode;
  className?: string;
}

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform duration-300 ease-out-expo group-hover/btn:translate-x-0.5" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function buttonClass({ variant = "primary", size = "md", className }: Pick<Common, "variant" | "size" | "className">) {
  return cn(base, variants[variant], sizes[size], className);
}

export function ButtonLink({ variant, size, arrow, children, className, ...props }: Common & ComponentProps<typeof Link>) {
  return (
    <Link className={buttonClass({ variant, size, className })} {...props}>
      {children}
      {arrow && <Arrow />}
    </Link>
  );
}

export function Button({ variant, size, arrow, children, className, ...props }: Common & ComponentProps<"button">) {
  return (
    <button className={buttonClass({ variant, size, className })} {...props}>
      {children}
      {arrow && <Arrow />}
    </button>
  );
}
