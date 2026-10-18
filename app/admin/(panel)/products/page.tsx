import type { Metadata } from "next";
import { ProductTable } from "@/components/admin/ProductTable";
import { AdminPage } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { getAdminCatalog } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const { products, categories } = await getAdminCatalog();
  return (
    <AdminPage
      title="Products"
      description="Everything listed in the store. Click a product to edit it."
      actions={
        <ButtonLink href="/admin/products/new" size="sm">
          <Icon name="plus" size={16} /> New product
        </ButtonLink>
      }
    >
      <ProductTable products={products} categories={categories} />
    </AdminPage>
  );
}
