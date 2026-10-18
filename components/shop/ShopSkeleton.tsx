/** Placeholder shown while a category resolves. */
export function ShopSkeleton() {
  return (
    <section className="shell animate-pulse pt-[calc(var(--header-h)+2.5rem)] pb-24" aria-busy="true" aria-label="Loading products">
      <div className="h-4 w-40 rounded-full bg-paper-2" />
      <div className="mt-8 h-20 w-2/3 rounded-3xl bg-paper-2" />
      <div className="mt-6 h-5 w-1/2 rounded-full bg-paper-2" />
      <div className="mt-14 h-12 rounded-full bg-paper-2" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="aspect-[4/5] rounded-[28px] bg-paper-2" />
        ))}
      </div>
    </section>
  );
}
