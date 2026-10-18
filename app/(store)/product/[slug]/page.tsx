import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductSkeleton } from "@/components/product/ProductSkeleton";
import { ProductShelf } from "@/components/product/ProductShelf";
import { ProductView } from "@/components/product/ProductView";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getAttributes, getCategoryById, getProduct, getProductSlugs, getRelatedProducts } from "@/lib/catalog/repository";
import { optionValues, priceRange } from "@/lib/catalog/variants";
import { site } from "@/lib/config/site";

export async function generateStaticParams() {
  const slugs = await getProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.summary,
    openGraph: { title: product.name, description: product.summary, images: [product.media[0].src] },
  };
}

export default function ProductPage({ params }: PageProps<"/product/[slug]">) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}

/** Reads the slug inside Suspense so navigations between products stay instant. */
async function ProductContent({ params }: Pick<PageProps<"/product/[slug]">, "params">) {
  const { slug } = await params;
  const [product, attributes] = await Promise.all([getProduct(slug), getAttributes()]);
  if (!product) notFound();

  const [category, related] = await Promise.all([getCategoryById(product.categoryId), getRelatedProducts(product, 6)]);
  const { min, max } = priceRange(product);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": product.kind === "service" ? "Service" : "Product",
    name: product.name,
    description: product.description,
    image: product.media.map((m) => `${site.url}${m.src}`),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: site.currency,
      lowPrice: min,
      highPrice: max,
      offerCount: product.variants.length,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\u003c") }} />

      <section className="shell pt-[calc(var(--header-h)+2rem)] pb-20">
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-mute">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/products" className="hover:text-ink">
                All products
              </Link>
            </li>
            {category && (
              <>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href={`/products/${category.slug}`} className="hover:text-ink">
                    {category.name}
                  </Link>
                </li>
              </>
            )}
            <li aria-hidden="true">/</li>
            <li className="text-ink">{product.name}</li>
          </ol>
        </nav>
        <ProductView product={product} attributes={attributes} />
      </section>

      <section className="bg-paper pb-24 md:pb-32">
        <div className="shell">
        <div className="grid gap-14 border-t border-line pt-16 md:pt-20 lg:grid-cols-[1fr_2fr]">
          <Reveal>
            <h2 className="text-[clamp(1.6rem,2.7vw,2.18rem)]">{product.kind === "service" ? "Repair details" : "Tech specs"}</h2>
            {product.description && <p className="mt-4 max-w-[42ch] leading-relaxed text-mute">{product.description}</p>}
            {product.inTheBox && (
              <div className="mt-10">
                <p className="eyebrow text-mute">{product.kind === "service" ? "Included" : "In the box"}</p>
                <ul className="mt-4 space-y-2">
                  {product.inTheBox.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Reveal>
          <Reveal delay={0.1}>
            <dl className="divide-y divide-line border-y border-line">
              {product.specs.map((spec) => (
                <div key={spec.label} className="grid gap-1 py-5 sm:grid-cols-[180px_1fr] sm:gap-6">
                  <dt className="text-mute">{spec.label}</dt>
                  <dd className="text-[1.02rem]">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="overflow-hidden bg-paper pb-24 md:pb-32">
          <div className="shell">
            <SectionHeading title="You may also like." subtitle={category ? `More from ${category.name}.` : undefined} />
          </div>
          <div className="mt-10">
            <ProductShelf
              label="Related products"
              items={related.map((p) => ({ product: p, colors: optionValues(p, attributes, "color"), fromPrice: priceRange(p).min, meta: p.turnaround }))}
            />
          </div>
        </section>
      )}
    </>
  );
}
