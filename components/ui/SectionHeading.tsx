import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Two-tone section title: a bold statement followed by a quieter line,
 * read as one sentence.
 */
export function SectionHeading({
  title,
  subtitle,
  eyebrow,
  action,
  tone = "light",
  className,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  action?: ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-6 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-3xl">
        {eyebrow && <p className={cn("eyebrow mb-4", tone === "dark" ? "text-accent-light" : "text-accent-ink")}>{eyebrow}</p>}
        <h2 className="text-[clamp(1.6rem,3.1vw,2.45rem)]">
          <span>{title}</span>{" "}
          {subtitle && <span className={tone === "dark" ? "text-night-mute" : "text-mute"}>{subtitle}</span>}
        </h2>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
