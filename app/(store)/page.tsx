import { AccessoryBento } from "@/components/home/AccessoryBento";
import { CategoryBento } from "@/components/home/CategoryBento";
import { ClosingCta } from "@/components/home/ClosingCta";
import { Hero } from "@/components/home/Hero";
import { InsideStory } from "@/components/home/InsideStory";
import { Proof } from "@/components/home/Proof";
import { RepairShowcase } from "@/components/home/RepairShowcase";
import { ProductShelf } from "@/components/product/ProductShelf";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getAttributes, getCategories, getProducts } from "@/lib/catalog/repository";
import { optionValues, priceRange } from "@/lib/catalog/variants";

export default async function HomePage() {
  const [attributes, categories, iphones, repairs, accessories] = await Promise.all([
    getAttributes(),
    getCategories(),
    getProducts({ categorySlug: "iphones", sort: "newest" }),
    getProducts({ categorySlug: "repairs" }),
    getProducts({ categorySlug: "accessories", sort: "featured" }),
  ]);

  const counts: Record<string, number> = { iphones: iphones.length, repairs: repairs.length, accessories: accessories.length };

  // New releases lead, then certified pre-owned, newest first within each.
  const isNew = (p: (typeof iphones)[number]) => p.variants.some((v) => v.selection.condition === "new");
  const latest = [...iphones.filter(isNew), ...iphones.filter((p) => !isNew(p))].map((product) => ({
    product,
    colors: optionValues(product, attributes, "color"),
    fromPrice: priceRange(product).min,
  }));

  return (
    <>
      <Hero />

      <CategoryBento tiles={categories.map((category) => ({ category, count: counts[category.slug] ?? 0 }))} />

      <section className="overflow-hidden bg-paper pb-24 md:pb-32">
        <div className="shell">
          <Reveal>
            <SectionHeading
              eyebrow="iPhone"
              title="The latest."
              subtitle="New and certified pre-owned."
              action={
                <ButtonLink href="/products/iphones" variant="outline" arrow>
                  Shop all iPhone
                </ButtonLink>
              }
            />
          </Reveal>
        </div>
        <div className="mt-12">
          <ProductShelf items={latest} label="Latest iPhone models" />
        </div>
      </section>

      <InsideStory />

      <RepairShowcase
        rows={repairs.map((p) => ({
          id: p.id,
          name: p.name,
          summary: p.summary,
          image: p.media[0].src,
          tint: p.tint,
          fromPrice: priceRange(p).min,
          turnaround: p.turnaround ?? "",
        }))}
      />

      <AccessoryBento items={accessories.slice(0, 5).map((product) => ({ product, image: product.media[0].src, fromPrice: priceRange(product).min }))} />

      <Proof />
      <ClosingCta />
    </>
  );
}
