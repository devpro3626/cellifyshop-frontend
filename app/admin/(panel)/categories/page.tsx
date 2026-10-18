import type { Metadata } from "next";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { AdminPage } from "@/components/admin/ui";
import { getAdminCatalog } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const { categories, products } = await getAdminCatalog();
  const counts = Object.fromEntries(categories.map((c) => [c.id, products.filter((p) => p.categoryId === c.id).length]));
  return (
    <AdminPage title="Categories" description="Groups shown in the store navigation and on the All products page.">
      <CategoryManager categories={[...categories].sort((a, b) => a.order - b.order)} counts={counts} />
    </AdminPage>
  );
}
