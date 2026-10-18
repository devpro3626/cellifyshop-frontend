import type { Metadata } from "next";
import Link from "next/link";
import { AllProducts } from "@/components/shop/AllProducts";
import { RevealWords } from "@/components/ui/Reveal";
import { getAttributes, getCategories, getProducts } from "@/lib/catalog/repository";

export const metadata: Metadata = {
  title: "All products",
  description: "Every iPhone, repair and accessory at CellifyShop, grouped by category, with prices in AED.",
};

export default async function AllProductsPage() {
  const [attributes, categories, products] = await Promise.all([getAttributes(), getCategories(), getProducts({ sort: "featured" })]);

  return (
    <section className="shell pt-[calc(var(--header-h)+2.5rem)] pb-24 md:pb-32">
      <nav aria-label="Breadcrumb" className="text-sm text-mute">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-ink">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-ink">All products</li>
        </ol>
      </nav>
      <h1 className="mt-8 text-[clamp(2.24rem,4.8vw,4.08rem)] leading-[0.95] tracking-[-0.05em]">
        <RevealWords text="All products." />
      </h1>
      <p className="mt-5 mb-10 max-w-[52ch] text-[1.05rem] leading-relaxed text-mute">
        {products.length} products across {categories.length} categories. Prices in AED, shown up front.
      </p>
      <AllProducts categories={categories} products={products} attributes={attributes} />
    </section>
  );
}
