/** Placeholder shown while a category resolves. */
export function ShopSkeleton() {
  return (
    <section className="shell pt-[calc(var(--header-h)+2.5rem)] pb-24" aria-busy="true" aria-label="Loading products">
      <div className="h-4 w-40 rounded-full skeleton" />
      <div className="mt-8 h-20 w-2/3 rounded-3xl skeleton" />
      <div className="mt-6 h-5 w-1/2 rounded-full skeleton" />
      <div className="mt-14 h-12 rounded-full skeleton" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="aspect-[4/5] rounded-[28px] skeleton" />
        ))}
      </div>
    </section>
  );
}
