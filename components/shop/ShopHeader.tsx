import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";
import { RevealWords } from "@/components/ui/Reveal";

interface ShopHeaderProps {
  title: string;
  subtitle: string;
  categories: Category[];
  active?: Category;
}

/** Store heading with category tabs; category pages add their hero image. */
export function ShopHeader({ title, subtitle, categories, active }: ShopHeaderProps) {
  const cover = active?.imageFit === "cover";
  return (
    <header className="pt-[calc(var(--header-h)+2.5rem)]">
      <div className="shell">
        <nav aria-label="Breadcrumb" className="text-sm text-mute">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-ink">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>{active ? <Link href="/products" className="hover:text-ink">All products</Link> : <span className="text-ink">All products</span>}</li>
            {active && (
              <>
                <li aria-hidden="true">/</li>
                <li className="text-ink">{active.name}</li>
              </>
            )}
          </ol>
        </nav>

        <div className={cn("mt-8 grid gap-8", active && "lg:grid-cols-[1.1fr_1fr] lg:items-end")}>
          <div>
            <h1 className="text-[clamp(2.24rem,4.8vw,4.08rem)] leading-[0.95] tracking-[-0.05em]">
              <RevealWords text={title} className="block" />
            </h1>
            <p className="mt-5 max-w-[52ch] text-[1.05rem] leading-relaxed text-mute">{subtitle}</p>
          </div>
          {active && (
            <div className="relative h-56 overflow-hidden rounded-[28px] md:h-72" style={{ backgroundColor: active.tint }}>
              <Image src={active.image} alt="" fill preload sizes="(min-width: 1024px) 45vw, 100vw" className={cover ? "object-cover" : "object-contain p-6"} />
            </div>
          )}
        </div>

        <nav aria-label="Categories" className="no-scrollbar mt-10 flex gap-2 overflow-x-auto">
          {[{ slug: "", name: "All products" }, ...categories].map((c) => {
            const current = (active?.slug ?? "") === c.slug;
            return (
              <Link
                key={c.slug || "all"}
                href={c.slug ? `/products/${c.slug}` : "/products"}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition-colors",
                  current ? "bg-ink text-white" : "bg-paper-2 text-ink/70 hover:bg-line hover:text-ink",
                )}
              >
                {c.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
