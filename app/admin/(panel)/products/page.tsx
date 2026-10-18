import type { Metadata } from "next";
import { ListFilters } from "@/components/admin/ListFilters";
import { Pagination } from "@/components/admin/Pagination";
import { ProductTable } from "@/components/admin/ProductTable";
import { AdminPage } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { getAdminCategories, getAdminProducts, pageParam, param } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Products" };

const PAGE_SIZE = 10;

export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  const sp = await searchParams;
  const query = { q: param(sp.q), category: param(sp.category) };
  const [categories, result] = await Promise.all([
    getAdminCategories(),
    getAdminProducts({
      page: pageParam(sp.page),
      limit: PAGE_SIZE,
      search: query.q,
      category: query.category,
    }),
  ]);

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
      <div className="rounded-2xl border border-line bg-surface">
        <ListFilters
          searchPlaceholder="Search products"
          select={{
            name: "category",
            label: "All categories",
            options: categories.map((c) => ({ value: c.id, label: c.name })),
          }}
        />
        <ProductTable products={result.items} categories={categories} />
        <Pagination page={result.page} totalPages={result.totalPages} total={result.total} limit={result.limit} basePath="/admin/products" query={query} noun="products" />
      </div>
    </AdminPage>
  );
}
