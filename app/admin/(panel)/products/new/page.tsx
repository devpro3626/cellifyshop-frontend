import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/ProductForm";
import { AdminPage } from "@/components/admin/ui";
import { getAdminCatalog } from "@/lib/admin/data";
import type { Product } from "@/lib/catalog/types";

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
  const { categories, attributes } = await getAdminCatalog();
  const blank: Product = {
    id: "",
    slug: "",
    name: "",
    categoryId: categories[0]?.id ?? "",
    kind: "device",
    summary: "",
    description: "",
    highlights: [],
    specs: [],
    inTheBox: [],
    options: [],
    variants: [{ id: "single", sku: "", selection: {}, price: 0, stock: 5 }],
    media: [],
    tint: "#EEEEEF",
    featured: false,
    createdAt: "",
  };
  return (
    <AdminPage title="New product" description="Fill in the basics, add images, then choose its options.">
      <ProductForm initial={blank} categories={categories} attributes={attributes} isNew />
    </AdminPage>
  );
}
