import { cn } from "@/lib/utils";
import { FadeIn } from "@/components/motion/fade-in";

export function Section({
  id,
  children,
  className,
  tone = "plain",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  tone?: "plain" | "sky" | "navy" | "water";
}) {
  return (
    <section
      id={id}
      className={cn(
        "px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20",
        tone === "sky" && "bg-sky-50",
        tone === "water" && "water-band",
        tone === "navy" && "bg-navy-950 text-white",
        tone === "plain" && "bg-white",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-7xl">{children}</div>
    </section>
  );
}

export function SectionHeading({
  title,
  description,
  eyebrow,
  align = "left",
  light = false,
  action,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  align?: "left" | "center";
  light?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <FadeIn>
    <div
      className={cn(
        "mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "mx-auto max-w-3xl text-center sm:flex-col sm:items-center",
      )}
    >
      <div className={cn("max-w-3xl", align === "center" && "mx-auto")}>
        {eyebrow ? (
          <p className={cn("section-eyebrow", light && "text-aqua-400 before:bg-aqua-400")}>
            {eyebrow}
          </p>
        ) : null}
        <h2
          className={cn(
            "font-display text-2xl font-semibold tracking-tight sm:text-3xl",
            eyebrow && "mt-3",
            light ? "text-white" : "text-navy-950",
          )}
        >
          {title}
        </h2>
        {description ? (
          <p
            className={cn(
              "mt-3 max-w-2xl text-base leading-relaxed",
              light ? "text-white/75" : "text-slate-600",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
    </FadeIn>
  );
}
