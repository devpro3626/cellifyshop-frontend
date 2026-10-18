import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminLoading } from "@/components/admin/AdminLoading";
import { ProductForm } from "@/components/admin/ProductForm";
import { AdminPage } from "@/components/admin/ui";
import { getAdminCatalog } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Edit product" };

export default function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  return (
    <Suspense fallback={<AdminLoading />}>
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
      description={`/product/${product.id}`}
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
