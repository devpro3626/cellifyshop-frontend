import Image from "next/image";
import Link from "next/link";
import { AdminPage, Card } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { getAdminCatalog, getAdminMessages } from "@/lib/admin/data";
import { formatPrice } from "@/lib/format";
import { priceRange } from "@/lib/catalog/variants";

export default async function AdminDashboard() {
  const [{ products, categories, attributes }, messages] = await Promise.all([getAdminCatalog(), getAdminMessages({ limit: 4 })]);
  const lowStock = products.flatMap((p) => p.variants.filter((v) => v.stock <= 2 && p.kind !== "service").map((v) => ({ product: p, variant: v }))).slice(0, 6);
  const recent = [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  const stats = [
    { label: "Products", value: products.length, href: "/admin/products" },
    {
      label: "Categories",
      value: categories.length,
      href: "/admin/categories",
    },
    { label: "Attributes", value: attributes.length, href: "/admin/taxonomy" },
    {
      label: "Unread messages",
      value: messages.unread,
      href: "/admin/messages?status=unread",
    },
  ];

  return (
    <AdminPage
      title="Dashboard"
      description="An overview of your catalogue."
      actions={
        <ButtonLink href="/admin/products/new" size="sm">
          <Icon name="plus" size={16} /> New product
        </ButtonLink>
      }
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-ink/30 sm:p-5">
            <p className="text-[0.85rem] text-mute">{s.label}</p>
            <p className="mt-2 font-display text-2xl font-semibold sm:text-3xl tracking-[-0.04em] tabular-nums">{s.value}</p>
          </Link>
        ))}
      </div>

      <Card
        title="Latest messages"
        className="mt-6"
        aside={
          <Link href="/admin/messages" className="text-[0.85rem] text-accent-ink hover:underline">
            Open inbox
          </Link>
        }
      >
        {messages.items.length ? (
          <ul className="divide-y divide-line">
            {messages.items.map((m) => (
              <li key={m.id}>
                <Link href="/admin/messages" className="flex items-center gap-3 py-3 hover:opacity-80">
                  <span className={m.read ? "h-2 w-2 shrink-0 rounded-full" : "h-2 w-2 shrink-0 rounded-full bg-accent"} />
                  <span className="min-w-0 flex-1">
                    <span className={m.read ? "block text-[0.92rem]" : "block text-[0.92rem] font-semibold"}>
                      {m.name} <span className="font-normal text-mute">· {m.phone}</span>
                    </span>
                    <span className="block truncate text-[0.85rem] text-mute">{m.message}</span>
                  </span>
                  <span className="shrink-0 text-[0.78rem] text-mute">{m.createdAt.slice(0, 10)}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[0.9rem] text-mute">No messages yet. Messages from the contact page will appear here.</p>
        )}
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Recently added">
          <ul className="divide-y divide-line">
            {recent.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 py-3 hover:opacity-80">
                  <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg" style={{ backgroundColor: p.tint }}>
                    {p.media[0] && <Image src={p.media[0].src} alt="" fill sizes="44px" className={p.kind === "service" ? "object-cover" : "object-contain p-1"} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.92rem] font-medium">{p.name}</span>
                    <span className="text-[0.8rem] text-mute">Added {p.createdAt.slice(0, 10)}</span>
                  </span>
                  <span className="text-[0.88rem] tabular-nums">{p.variants.length ? formatPrice(priceRange(p).min) : "—"}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Low stock" description="Variants with two or fewer units.">
          {lowStock.length ? (
            <ul className="divide-y divide-line">
              {lowStock.map(({ product, variant }) => (
                <li key={variant.id}>
                  <Link href={`/admin/products/${product.id}`} className="flex items-center justify-between gap-3 py-3 hover:opacity-80">
                    <span className="min-w-0">
                      <span className="block truncate text-[0.92rem] font-medium">{product.name}</span>
                      <span className="text-[0.8rem] text-mute">{variant.sku}</span>
                    </span>
                    <span className={variant.stock === 0 ? "text-[0.85rem] font-medium text-warn" : "text-[0.85rem] text-mute"}>{variant.stock === 0 ? "Sold out" : `${variant.stock} left`}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[0.9rem] text-mute">Everything is well stocked.</p>
          )}
        </Card>
      </div>
    </AdminPage>
  );
}
