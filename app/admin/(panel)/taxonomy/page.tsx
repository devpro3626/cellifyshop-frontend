import type { Metadata } from "next";
import { TaxonomyManager } from "@/components/admin/TaxonomyManager";
import { AdminPage } from "@/components/admin/ui";
import { getAdminCatalog } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Taxonomy" };

export default async function AdminTaxonomyPage() {
  const { attributes, products } = await getAdminCatalog();
  const usage = Object.fromEntries(attributes.map((a) => [a.id, products.filter((p) => p.options.some((o) => o.attributeId === a.id)).length]));
  return (
    <AdminPage title="Taxonomy" description="Attributes such as colour, storage and condition. Products pick their options from these values.">
      <TaxonomyManager attributes={attributes} usage={usage} />
    </AdminPage>
  );
}
