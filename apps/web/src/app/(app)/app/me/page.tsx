"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createIndicatorResult,
  fetchIndicatorResults,
  fetchStrategicKRAs,
  updateIndicatorResult,
} from "@/lib/api";
import { Badge, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

const schema = z.object({
  indicator: z.coerce.number().min(1, "Select an indicator"),
  period_label: z.string().min(2, "Enter a period label"),
  period_start: z.string().min(1, "Enter start date"),
  period_end: z.string().min(1, "Enter end date"),
  actual_value: z.string().min(1, "Enter actual value"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function statusLabel(status: string) {
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  if (status === "submitted") return "Submitted";
  return "Draft";
}

export default function MonitoringEvaluationPage() {
  const queryClient = useQueryClient();
  const { push } = useToast();

  const krasQuery = useQuery({
    queryKey: ["strategic-kras"],
    queryFn: fetchStrategicKRAs,
  });
  const resultsQuery = useQuery({
    queryKey: ["indicator-results"],
    queryFn: fetchIndicatorResults,
  });

  const indicators = useMemo(
    () =>
      (krasQuery.data ?? []).flatMap((kra) =>
        (kra.indicators ?? []).map((indicator) => ({
          ...indicator,
          kra_code: kra.code,
          kra_title: kra.title,
        })),
      ),
    [krasQuery.data],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      indicator: 0,
      period_label: "",
      period_start: "",
      period_end: "",
      actual_value: "",
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: createIndicatorResult,
    onSuccess: async () => {
      reset();
      await queryClient.invalidateQueries({ queryKey: ["indicator-results"] });
      push("Indicator result submitted.", "success");
    },
    onError: (error: Error) => push(error.message, "error"),
  });

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number;
      status: "submitted" | "approved" | "rejected";
    }) => updateIndicatorResult(id, { status }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["indicator-results"] });
      push("Result status updated.", "success");
    },
    onError: (error: Error) => push(error.message, "error"),
  });

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        Track strategic KRAs and indicators, submit period results, and approve
        or reject submissions.
      </p>

      <section className="space-y-3">
        <h2 className="font-display text-xl text-navy-950">Strategic KRAs</h2>
        {krasQuery.isError ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
            Unable to load KRAs.
          </p>
        ) : null}
        {krasQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : !krasQuery.data?.length ? (
          <EmptyState
            title="No KRAs configured"
            description="Strategic key result areas will appear here once seeded."
          />
        ) : (
          <div className="space-y-3">
            {krasQuery.data.map((kra) => (
              <article
                key={kra.id}
                className="rounded-2xl border border-border bg-white p-5 shadow-sm"
              >
                <h3 className="font-display text-lg text-navy-950">
                  {kra.code}: {kra.title}
                </h3>
                <p className="mt-1 text-sm text-slate-600">{kra.objective}</p>
                <ul className="mt-3 space-y-2">
                  {(kra.indicators ?? []).map((indicator) => (
                    <li
                      key={indicator.id}
                      className="rounded-xl bg-sky-50/70 px-3 py-2 text-sm"
                    >
                      <p className="font-semibold text-navy-950">
                        {indicator.code} — {indicator.title}
                      </p>
                      <p className="text-xs text-slate-600">
                        Target {indicator.annual_target}
                        {indicator.unit ? ` ${indicator.unit}` : ""} ·{" "}
                        {indicator.frequency}
                        {indicator.responsible_officer
                          ? ` · ${indicator.responsible_officer}`
                          : ""}
                      </p>
                    </li>
                  ))}
                  {!kra.indicators?.length ? (
                    <li className="text-sm text-slate-600">No indicators.</li>
                  ) : null}
                </ul>
              </article>
            ))}
          </div>
        )}
      </section>

      <form
        onSubmit={handleSubmit((values) => {
          createMutation.mutate({
            indicator: values.indicator,
            period_label: values.period_label,
            period_start: values.period_start,
            period_end: values.period_end,
            actual_value: values.actual_value,
            variance_notes: values.notes || "",
            status: "submitted",
          });
        })}
        className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-sm"
        noValidate
      >
        <div>
          <h2 className="font-display text-xl text-navy-950">
            Submit indicator result
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Record actual performance against a period target.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label
              htmlFor="indicator"
              className="mb-1.5 block text-sm font-semibold"
            >
              Indicator <span className="text-danger">*</span>
            </label>
            <select
              id="indicator"
              className="h-11 w-full rounded-xl border border-border bg-white px-3.5 text-sm focus-ring"
              {...register("indicator")}
            >
              <option value={0}>Select indicator…</option>
              {indicators.map((indicator) => (
                <option key={indicator.id} value={indicator.id}>
                  {indicator.kra_code} · {indicator.code} — {indicator.title}
                </option>
              ))}
            </select>
            {errors.indicator ? (
              <p className="mt-1 text-xs text-danger">
                {errors.indicator.message}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="period_label"
              className="mb-1.5 block text-sm font-semibold"
            >
              Period label <span className="text-danger">*</span>
            </label>
            <Input
              id="period_label"
              placeholder="Q1 2026"
              {...register("period_label")}
            />
            {errors.period_label ? (
              <p className="mt-1 text-xs text-danger">
                {errors.period_label.message}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="actual_value"
              className="mb-1.5 block text-sm font-semibold"
            >
              Actual value <span className="text-danger">*</span>
            </label>
            <Input id="actual_value" {...register("actual_value")} />
            {errors.actual_value ? (
              <p className="mt-1 text-xs text-danger">
                {errors.actual_value.message}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="period_start"
              className="mb-1.5 block text-sm font-semibold"
            >
              Period start
            </label>
            <Input id="period_start" type="date" {...register("period_start")} />
          </div>

          <div>
            <label
              htmlFor="period_end"
              className="mb-1.5 block text-sm font-semibold"
            >
              Period end
            </label>
            <Input id="period_end" type="date" {...register("period_end")} />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="notes" className="mb-1.5 block text-sm font-semibold">
              Notes
            </label>
            <textarea
              id="notes"
              rows={2}
              className="w-full rounded-xl border border-border px-3.5 py-3 text-sm focus-ring"
              {...register("notes")}
            />
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
          {createMutation.isPending ? "Submitting…" : "Submit result"}
        </Button>
      </form>

      <section className="space-y-3">
        <h2 className="font-display text-xl text-navy-950">Indicator results</h2>
        {resultsQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : !resultsQuery.data?.length ? (
          <EmptyState
            title="No results yet"
            description="Submitted indicator results will appear here."
          />
        ) : (
          <div className="space-y-3">
            {resultsQuery.data.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-border bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg text-navy-950">
                      {item.indicator_code} — {item.indicator_title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {item.period_label} · Actual {item.actual_value}
                      {item.annual_target
                        ? ` · Target ${item.annual_target}`
                        : ""}
                    </p>
                  </div>
                  <Badge tone={statusTone(statusLabel(item.status))}>
                    {item.status.replaceAll("_", " ")}
                  </Badge>
                </div>
                {item.variance_notes ? (
                  <p className="mt-3 text-sm text-slate-600">
                    {item.variance_notes}
                  </p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.status !== "submitted" ? (
                    <button
                      type="button"
                      className="rounded-xl border border-ocean-600/30 px-4 py-2 text-sm font-semibold text-ocean-700 hover:bg-sky-50 focus-ring"
                      onClick={() =>
                        statusMutation.mutate({
                          id: item.id,
                          status: "submitted",
                        })
                      }
                    >
                      Mark submitted
                    </button>
                  ) : null}
                  {item.status !== "approved" ? (
                    <button
                      type="button"
                      className="rounded-xl bg-ocean-600 px-4 py-2 text-sm font-semibold text-white hover:bg-ocean-500 focus-ring"
                      onClick={() =>
                        statusMutation.mutate({
                          id: item.id,
                          status: "approved",
                        })
                      }
                    >
                      Approve
                    </button>
                  ) : null}
                  {item.status !== "rejected" ? (
                    <button
                      type="button"
                      className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-danger hover:bg-red-50 focus-ring"
                      onClick={() =>
                        statusMutation.mutate({
                          id: item.id,
                          status: "rejected",
                        })
                      }
                    >
                      Reject
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
