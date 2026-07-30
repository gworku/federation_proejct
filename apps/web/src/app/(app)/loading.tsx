export default function AppLoading() {
  return (
    <div className="space-y-4" role="status" aria-live="polite">
      <div className="h-28 animate-pulse rounded-2xl bg-white" />
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-white" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-white" />
      <span className="sr-only">Loading workspace…</span>
    </div>
  );
}
