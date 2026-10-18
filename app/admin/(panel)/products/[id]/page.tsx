import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductForm } from "@/components/admin/ProductForm";
import { AdminPage } from "@/components/admin/ui";
import { getAdminCatalog } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Edit product" };

export default function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-10 py-10 text-mute">Loading…</div>}>
      <Editor params={params} />
    </Suspense>
  );
}

async function Editor({ params }: Pick<PageProps<"/admin/products/[id]">, "params">) {
  const { id } = await params;
  const { products, categories, attributes } = await getAdminCatalog();
  const product = products.find((p) => p.id === id);
  if (!product) notFound();

  return (
    <AdminPage
      title={product.name}
      description={`/product/${product.slug}`}
      actions={
        <Link href="/admin/products" className="text-[0.9rem] text-mute hover:text-ink">
          ← All products
        </Link>
      }
    >
      <ProductForm key={product.id} initial={product} categories={categories} attributes={attributes} isNew={false} />
    </AdminPage>
  );
}
