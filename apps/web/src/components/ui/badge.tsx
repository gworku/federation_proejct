import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  default: "bg-sky-100 text-navy-800",
  success: "bg-teal-50 text-success",
  warning: "bg-amber-50 text-warning",
  danger: "bg-red-50 text-danger",
  info: "bg-sky-100 text-ocean-700",
  muted: "bg-slate-100 text-slate-700",
};

export function Badge({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
        tones[tone] ?? tones.default,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function statusTone(status: string): keyof typeof tones {
  const map: Record<string, keyof typeof tones> = {
    Active: "success",
    Completed: "success",
    Approved: "success",
    Digitizing: "info",
    "Under Review": "warning",
    Submitted: "warning",
    Planning: "muted",
    Draft: "muted",
    "Support Needed": "warning",
    Overdue: "danger",
    Rejected: "danger",
    Suspended: "danger",
    Cancelled: "muted",
  };
  return map[status] ?? "default";
}
