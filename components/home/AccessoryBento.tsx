import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";
import { ButtonLink } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export interface BentoItem {
  product: Product;
  image: string;
  fromPrice: number;
}

/** Layout slots for up to five accessories: one hero tile and four supporting tiles. */
const SLOTS = [
  "md:col-span-2 md:row-span-2 min-h-[460px] md:min-h-[640px]",
  "min-h-[300px]",
  "min-h-[300px]",
  "min-h-[300px]",
  "min-h-[300px]",
];

export function AccessoryBento({ items }: { items: BentoItem[] }) {
  return (
    <section className="bg-paper py-24 md:py-32">
      <div className="shell">
        <Reveal>
          <SectionHeading
            eyebrow="Accessories"
            title="Finish it properly."
            subtitle="Cases, power and audio that we use ourselves."
            action={
              <ButtonLink href="/products/accessories" variant="outline" arrow>
                Shop accessories
              </ButtonLink>
            }
          />
        </Reveal>

        <div className="mt-12 grid gap-4 md:mt-16 md:grid-cols-4">
          {items.slice(0, SLOTS.length).map((item, i) => {
            const lead = i === 0;
            return (
              <Reveal key={item.product.id} delay={i * 0.06} className={SLOTS[i]}>
                <Link href={`/product/${item.product.id}`} className="group relative flex h-full flex-col overflow-hidden rounded-[28px] p-6 md:p-7" style={{ backgroundColor: item.product.tint }}>
                  <div className="relative z-10">
                    {item.product.badge && <p className="eyebrow mb-2 text-accent-ink">{item.product.badge}</p>}
                    <h3 className={cn("font-semibold", lead ? "text-[clamp(1.6rem,2.4vw,2.04rem)]" : "text-[1.15rem]")}>{item.product.name}</h3>
                    {lead && <p className="mt-2 max-w-[36ch] text-ink/60">{item.product.summary}</p>}
                    <p className="mt-2 text-[0.92rem] font-medium">
                      <Price amount={item.fromPrice} from={item.product.variants.length > 1} />
                    </p>
                  </div>
                  <div className="relative mt-2 min-h-[180px] flex-1">
                    <Image
                      src={item.image}
                      alt={item.product.name}
                      fill
                      sizes={lead ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 100vw"}
                      className="object-contain transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover:scale-[1.04]"
                    />
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
