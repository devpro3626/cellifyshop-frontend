import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface Tile {
  category: Category;
  count: number;
}

export function CategoryBento({ tiles }: { tiles: Tile[] }) {
  const [lead, ...rest] = tiles;
  return (
    <section className="bg-paper py-24 md:py-32">
      <div className="shell">
        <Reveal>
          <SectionHeading eyebrow="The store" title="Everything iPhone." subtitle="Buy it, fix it, finish it, all under one roof." />
        </Reveal>

        <div className="mt-12 grid gap-4 md:mt-16 md:grid-cols-[1.35fr_1fr] md:grid-rows-2">
          {lead && <CategoryTile tile={lead} large className="md:row-span-2" />}
          {rest.map((tile, i) => (
            <CategoryTile key={tile.category.id} tile={tile} delay={0.1 * (i + 1)} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryTile({ tile, large, className, delay = 0 }: { tile: Tile; large?: boolean; className?: string; delay?: number }) {
  const { category, count } = tile;
  const cover = category.imageFit === "cover";
  return (
    <Reveal delay={delay} className={cn("h-full", className)}>
      <Link
        href={`/products/${category.slug}`}
        className={cn("group relative flex h-full flex-col overflow-hidden rounded-[32px]", large ? "min-h-[520px] md:min-h-[720px]" : "min-h-[340px]", cover && "text-white")}
        style={{ backgroundColor: category.tint }}
      >
        {cover && (
          <>
            <Image src={category.image} alt="" fill sizes="(min-width: 768px) 42vw, 100vw" className="object-cover transition-transform duration-[1.4s] ease-out-expo group-hover:scale-[1.05]" />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-night/90 via-night/55 to-night/10" />
          </>
        )}
        <div className="relative z-10 flex items-start justify-between p-7 md:p-9">
          <div>
            <p className={cn("eyebrow", cover ? "text-white/70" : "text-ink/50")}>
              {String(count).padStart(2, "0")} {category.slug === "repairs" ? "services" : "products"}
            </p>
            <h3 className={cn("mt-3 font-semibold", large ? "text-[clamp(2.08rem,3.4vw,2.99rem)]" : "text-[clamp(1.6rem,2.3vw,1.9rem)]")}>{category.name}</h3>
            <p className={cn("mt-2 max-w-[30ch]", cover ? "text-white/80" : "text-ink/60")}>{category.tagline}</p>
          </div>
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink text-white transition-[transform,background-color] duration-500 ease-out-expo group-hover:bg-accent" aria-hidden="true">
            <Icon name="arrowRight" />
          </span>
        </div>
        {!cover && (
        <div className={cn(large ? "relative mt-auto min-h-[360px] w-full flex-1" : "absolute right-0 bottom-0 h-[78%] w-[58%]")}>
          <Image
            src={category.image}
            alt=""
            fill
            sizes={large ? "(min-width: 768px) 56vw, 100vw" : "(min-width: 768px) 42vw, 100vw"}
            className={cn(
              "object-contain transition-transform duration-[1.2s] ease-out-expo group-hover:scale-[1.05]",
              large ? "p-6 md:p-12" : "object-right-bottom p-5",
            )}
          />
        </div>
        )}
      </Link>
    </Reveal>
  );
}
