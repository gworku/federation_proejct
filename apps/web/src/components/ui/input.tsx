import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-11 w-full rounded-md border border-border bg-white px-3.5 text-sm text-navy-800 transition placeholder:text-slate-600/60 focus-ring",
      className,
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";
