export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-md border border-dashed border-border bg-white px-6 py-12 text-center">
      <p className="font-display text-xl text-navy-950">{title}</p>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">{description}</p>
      ) : null}
    </div>
  );
}
