"use client";

import Image from "next/image";
import { useState } from "react";
import { org } from "@/lib/org";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  size?: number;
  className?: string;
  priority?: boolean;
};

/** Official emblem — no app-icon frame. */
export function BrandLogo({ size = 48, className, priority }: BrandLogoProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center text-white",
          className,
        )}
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <span
          className="font-display font-bold leading-none"
          style={{ fontSize: Math.max(11, size * 0.28) }}
        >
          {org.shortName}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={org.logo}
      alt={`${org.shortName} — Oromia Potable Water and Sewage Service Federation emblem`}
      width={size}
      height={size}
      priority={priority}
      onError={() => setFailed(true)}
      className={cn("shrink-0 object-contain", className)}
      style={{ width: size, height: size }}
    />
  );
}
