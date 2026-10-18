/** Skeleton shown while an admin screen loads. */
export function AdminLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-5 sm:py-8 md:px-10 md:py-10" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-48 rounded-lg skeleton" />
      <div className="mt-3 h-4 w-72 rounded skeleton" />
      <div className="mt-8 grid gap-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-16 rounded-2xl skeleton" />
        ))}
      </div>
    </div>
  );
}
