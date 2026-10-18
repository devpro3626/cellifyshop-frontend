/** Placeholder shown while a product page resolves. Mirrors the real layout to avoid shifts. */
export function ProductSkeleton() {
  return (
    <section className="shell animate-pulse pt-[calc(var(--header-h)+2rem)] pb-20" aria-busy="true" aria-label="Loading product">
      <div className="mb-8 h-4 w-48 rounded-full bg-paper-2" />
      <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        <div className="aspect-square rounded-[32px] bg-paper-2" />
        <div className="space-y-5">
          <div className="h-3 w-20 rounded-full bg-paper-2" />
          <div className="h-14 w-3/4 rounded-2xl bg-paper-2" />
          <div className="h-5 w-full rounded-full bg-paper-2" />
          <div className="h-10 w-40 rounded-xl bg-paper-2" />
          <div className="grid grid-cols-3 gap-2 pt-6">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-14 rounded-2xl bg-paper-2" />
            ))}
          </div>
          <div className="h-14 rounded-full bg-paper-2" />
        </div>
      </div>
    </section>
  );
}
