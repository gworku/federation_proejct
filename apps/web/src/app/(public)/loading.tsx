export default function PublicLoading() {
  return (
    <div
      className="mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8"
      role="status"
      aria-live="polite"
    >
      <div className="h-10 w-64 animate-pulse bg-sky-100" />
      <div className="mt-4 h-5 w-full max-w-2xl animate-pulse bg-sky-100/80" />
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="h-40 animate-pulse border border-border bg-white" />
        <div className="h-40 animate-pulse border border-border bg-white" />
        <div className="h-40 animate-pulse border border-border bg-white" />
        <div className="h-40 animate-pulse border border-border bg-white" />
      </div>
      <span className="sr-only">Loading page content…</span>
    </div>
  );
}
