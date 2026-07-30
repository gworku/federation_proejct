"use client";

import { useMemo, useState } from "react";
import type { CoverageZone } from "@/lib/api";
import { cn } from "@/lib/utils";

type Props = {
  zones: CoverageZone[];
  onSelectZone?: (zone: string) => void;
  selectedZone?: string;
};

export function CoverageMap({ zones, onSelectZone, selectedZone }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  const bounds = useMemo(() => {
    if (!zones.length) {
      return { minLat: 4, maxLat: 11, minLng: 34, maxLng: 43 };
    }
    const lats = zones.map((z) => z.lat);
    const lngs = zones.map((z) => z.lng);
    return {
      minLat: Math.min(...lats) - 0.4,
      maxLat: Math.max(...lats) + 0.4,
      minLng: Math.min(...lngs) - 0.5,
      maxLng: Math.max(...lngs) + 0.5,
    };
  }, [zones]);

  const maxTotal = Math.max(...zones.map((z) => z.total), 1);

  const toXY = (lat: number, lng: number) => {
    const x =
      ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng || 1)) * 100;
    const y =
      (1 - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat || 1)) * 100;
    return { x, y };
  };

  const active = zones.find((z) => z.zone === (hovered || selectedZone));

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="relative aspect-[16/11] overflow-hidden rounded-md border border-border bg-sky-100">
        <p className="absolute left-4 top-4 text-xs font-semibold uppercase tracking-wide text-slate-600">
          Coverage map
        </p>
        {zones.map((zone) => {
          const { x, y } = toXY(zone.lat, zone.lng);
          const size = 14 + (zone.total / maxTotal) * 28;
          const isActive =
            zone.zone === hovered || zone.zone === selectedZone;
          return (
            <button
              key={zone.zone}
              type="button"
              title={`${zone.zone}: ${zone.total} utilities`}
              onMouseEnter={() => setHovered(zone.zone)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(zone.zone)}
              onBlur={() => setHovered(null)}
              onClick={() => onSelectZone?.(zone.zone)}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 border-2 border-white transition focus-ring",
                isActive ? "bg-ocean-600" : "bg-navy-800 hover:bg-ocean-600",
              )}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: size,
                height: size,
              }}
              aria-label={`${zone.zone}, ${zone.total} utilities`}
            />
          );
        })}
      </div>

      <aside className="surface-card p-5">
        <h3 className="font-display text-xl text-navy-950">
          {active ? active.zone : "Zone summary"}
        </h3>
        {active ? (
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-3 border-b border-border pb-2">
              <dt className="text-slate-600">Utilities</dt>
              <dd className="font-semibold text-navy-950">{active.total}</dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-border pb-2">
              <dt className="text-slate-600">Active</dt>
              <dd className="font-semibold text-success">{active.active}</dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-border pb-2">
              <dt className="text-slate-600">Digitizing</dt>
              <dd className="font-semibold text-ocean-700">{active.digitizing}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-600">Support needed</dt>
              <dd className="font-semibold text-warning">
                {active.support_needed}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="mt-3 text-sm text-slate-600">
            Select a zone marker to inspect coverage counts.
          </p>
        )}
        <ul className="mt-5 max-h-56 space-y-0 overflow-auto border-t border-border text-sm">
          {zones.map((zone) => (
            <li key={zone.zone} className="border-b border-border">
              <button
                type="button"
                onClick={() => onSelectZone?.(zone.zone)}
                className={cn(
                  "flex w-full items-center justify-between px-1 py-2.5 text-left focus-ring",
                  selectedZone === zone.zone
                    ? "bg-sky-50 font-semibold text-navy-950"
                    : "hover:bg-sky-50",
                )}
              >
                <span>{zone.zone}</span>
                <span className="tabular-nums text-ocean-700">{zone.total}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
