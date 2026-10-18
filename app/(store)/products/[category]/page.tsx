import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ShopSkeleton } from "@/components/shop/ShopSkeleton";
import { RepairProcess } from "@/components/shop/RepairProcess";
import { ShopBrowser } from "@/components/shop/ShopBrowser";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { getAttributes, getCategories, getCategory, getProducts } from "@/lib/catalog/repository";

const HEADLINES: Record<string, string> = {
  iphones: "iPhone.",
  repairs: "Repair.",
  accessories: "Accessories.",
};

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[category]">): Promise<Metadata> {
  const category = await getCategory((await params).category);
  return category ? { title: category.name, description: category.description } : {};
}

export default function CategoryPage({ params }: PageProps<"/products/[category]">) {
  return (
    <Suspense fallback={<ShopSkeleton />}>
      <CategoryContent params={params} />
    </Suspense>
  );
}

async function CategoryContent({ params }: Pick<PageProps<"/products/[category]">, "params">) {
  const { category: slug } = await params;
  const [category, categories, attributes, products] = await Promise.all([getCategory(slug), getCategories(), getAttributes(), getProducts({ categorySlug: slug })]);
  if (!category) notFound();

  return (
    <>
      <ShopHeader title={HEADLINES[category.slug] ?? `${category.name}.`} subtitle={category.description} categories={categories} active={category} />
      {category.slug === "repairs" && <RepairProcess />}
      <section className="shell pt-8 pb-24 md:pb-32">
        <ShopBrowser products={products} attributes={attributes} />
      </section>
    </>
  );
}
