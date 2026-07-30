"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  createUtilityKPI,
  fetchBenchmarkingSummary,
  fetchUtilities,
  fetchUtilityKPIs,
  updateUtilityKPI,
} from "@/lib/api";
import { Badge, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

const schema = z.object({
  utility: z.coerce.number().min(1, "Select a utility"),
  period_label: z.string().min(2, "Enter a period label"),
  period_start: z.string().min(1, "Enter start date"),
  period_end: z.string().min(1, "Enter end date"),
  nrw_percent: z.string().optional(),
  billing_efficiency_percent: z.string().optional(),
  collection_efficiency_percent: z.string().optional(),
  service_coverage_percent: z.string().optional(),
  meter_coverage_percent: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function statusLabel(status: string) {
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  if (status === "submitted") return "Submitted";
  return "Draft";
}

function pct(value: string | null | undefined) {
  if (value == null || value === "") return "—";
  return `${value}%`;
}

export default function BenchmarkingPage() {
  const queryClient = useQueryClient();
  const { push } = useToast();

  const summaryQuery = useQuery({
    queryKey: ["benchmarking-summary"],
    queryFn: fetchBenchmarkingSummary,
  });
  const kpisQuery = useQuery({
    queryKey: ["utility-kpis"],
    queryFn: fetchUtilityKPIs,
  });
  const utilitiesQuery = useQuery({
    queryKey: ["benchmarking-utilities"],
    queryFn: () => fetchUtilities(),
  });

  const chartData = useMemo(
    () =>
      (summaryQuery.data?.results ?? [])
        .filter((row) => row.nrw_percent != null && row.nrw_percent !== "")
        .map((row) => ({
          utility:
            row.utility.length > 18
              ? `${row.utility.slice(0, 16)}…`
              : row.utility,
          nrw: Number(row.nrw_percent),
        }))
        .slice(0, 12),
    [summaryQuery.data],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      utility: 0,
      period_label: "",
      period_start: "",
      period_end: "",
      nrw_percent: "",
      billing_efficiency_percent: "",
      collection_efficiency_percent: "",
      service_coverage_percent: "",
      meter_coverage_percent: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: createUtilityKPI,
    onSuccess: async () => {
      reset();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["utility-kpis"] }),
        queryClient.invalidateQueries({ queryKey: ["benchmarking-summary"] }),
      ]);
      push("KPI submission saved.", "success");
    },
    onError: (error: Error) => push(error.message, "error"),
  });

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number;
      status: "approved" | "rejected" | "submitted";
    }) => updateUtilityKPI(id, { status }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["utility-kpis"] }),
        queryClient.invalidateQueries({ queryKey: ["benchmarking-summary"] }),
      ]);
      push("KPI status updated.", "success");
    },
    onError: (error: Error) => push(error.message, "error"),
  });

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        Compare utility performance KPIs and review submitted benchmarking
        reports.
      </p>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <article className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h2 className="font-display text-xl text-navy-950">NRW by utility</h2>
          <p className="mt-1 text-sm text-slate-600">
            Non-revenue water % from approved / latest submissions
          </p>
          <div className="mt-4 h-72">
            {summaryQuery.isLoading ? (
              <Skeleton className="h-full" />
            ) : chartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d7e6ef" />
                  <XAxis dataKey="utility" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip />
                  <Bar dataKey="nrw" fill="#0b6e99" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-600">No benchmarking data yet.</p>
            )}
          </div>
        </article>

        <article className="overflow-x-auto rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h2 className="font-display text-xl text-navy-950">Summary table</h2>
          {summaryQuery.isLoading ? (
            <Skeleton className="mt-4 h-48" />
          ) : !summaryQuery.data?.results?.length ? (
            <p className="mt-4 text-sm text-slate-600">No rows available.</p>
          ) : (
            <table className="mt-4 w-full min-w-[480px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-600">
                <tr className="border-b border-border">
                  <th className="py-2 pr-3 font-semibold">Utility</th>
                  <th className="py-2 pr-3 font-semibold">NRW</th>
                  <th className="py-2 pr-3 font-semibold">Billing</th>
                  <th className="py-2 font-semibold">Collection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {summaryQuery.data.results.map((row) => (
                  <tr key={`${row.utility}-${row.period_label}`}>
                    <td className="py-2.5 pr-3">
                      <p className="font-semibold text-navy-950">{row.utility}</p>
                      <p className="text-xs text-slate-600">
                        {row.zone} · {row.period_label}
                      </p>
                    </td>
                    <td className="py-2.5 pr-3">{pct(row.nrw_percent)}</td>
                    <td className="py-2.5 pr-3">
                      {pct(row.billing_efficiency_percent)}
                    </td>
                    <td className="py-2.5">
                      {pct(row.collection_efficiency_percent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </article>
      </section>

      <form
        onSubmit={handleSubmit((values) => {
          createMutation.mutate({
            utility: values.utility,
            period_label: values.period_label,
            period_start: values.period_start,
            period_end: values.period_end,
            nrw_percent: values.nrw_percent || null,
            billing_efficiency_percent:
              values.billing_efficiency_percent || null,
            collection_efficiency_percent:
              values.collection_efficiency_percent || null,
            service_coverage_percent: values.service_coverage_percent || null,
            meter_coverage_percent: values.meter_coverage_percent || null,
            status: "submitted",
          });
        })}
        className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-sm"
        noValidate
      >
        <div>
          <h2 className="font-display text-xl text-navy-950">Submit utility KPI</h2>
          <p className="mt-1 text-sm text-slate-600">
            Enter period performance metrics for a member utility.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="md:col-span-2 xl:col-span-3">
            <label
              htmlFor="utility"
              className="mb-1.5 block text-sm font-semibold"
            >
              Utility <span className="text-danger">*</span>
            </label>
            <select
              id="utility"
              className="h-11 w-full rounded-xl border border-border bg-white px-3.5 text-sm focus-ring"
              {...register("utility")}
            >
              <option value={0}>Select utility…</option>
              {(utilitiesQuery.data ?? []).map((utility) => (
                <option key={utility.id} value={utility.id}>
                  {utility.name}
                </option>
              ))}
            </select>
            {errors.utility ? (
              <p className="mt-1 text-xs text-danger">{errors.utility.message}</p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="period_label"
              className="mb-1.5 block text-sm font-semibold"
            >
              Period label
            </label>
            <Input
              id="period_label"
              placeholder="FY 2025/26"
              {...register("period_label")}
            />
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
          <div>
            <label
              htmlFor="nrw_percent"
              className="mb-1.5 block text-sm font-semibold"
            >
              NRW %
            </label>
            <Input id="nrw_percent" {...register("nrw_percent")} />
          </div>
          <div>
            <label
              htmlFor="billing_efficiency_percent"
              className="mb-1.5 block text-sm font-semibold"
            >
              Billing efficiency %
            </label>
            <Input
              id="billing_efficiency_percent"
              {...register("billing_efficiency_percent")}
            />
          </div>
          <div>
            <label
              htmlFor="collection_efficiency_percent"
              className="mb-1.5 block text-sm font-semibold"
            >
              Collection efficiency %
            </label>
            <Input
              id="collection_efficiency_percent"
              {...register("collection_efficiency_percent")}
            />
          </div>
          <div>
            <label
              htmlFor="service_coverage_percent"
              className="mb-1.5 block text-sm font-semibold"
            >
              Service coverage %
            </label>
            <Input
              id="service_coverage_percent"
              {...register("service_coverage_percent")}
            />
          </div>
          <div>
            <label
              htmlFor="meter_coverage_percent"
              className="mb-1.5 block text-sm font-semibold"
            >
              Meter coverage %
            </label>
            <Input
              id="meter_coverage_percent"
              {...register("meter_coverage_percent")}
            />
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
          {createMutation.isPending ? "Saving…" : "Submit KPI"}
        </Button>
      </form>

      <section className="space-y-3">
        <h2 className="font-display text-xl text-navy-950">KPI submissions</h2>
        {kpisQuery.isError ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
            Unable to load KPI submissions.
          </p>
        ) : null}
        {kpisQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : !kpisQuery.data?.length ? (
          <EmptyState
            title="No KPI submissions"
            description="Submitted utility KPIs will appear here for review."
          />
        ) : (
          <div className="space-y-3">
            {kpisQuery.data.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-border bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg text-navy-950">
                      {item.utility_name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {item.period_label} · {item.zone}
                    </p>
                  </div>
                  <Badge tone={statusTone(statusLabel(item.status))}>
                    {item.status.replaceAll("_", " ")}
                  </Badge>
                </div>
                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <dt className="text-xs text-slate-600">NRW</dt>
                    <dd className="font-semibold text-navy-950">
                      {pct(item.nrw_percent)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-600">Billing</dt>
                    <dd className="font-semibold text-navy-950">
                      {pct(item.billing_efficiency_percent)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-600">Collection</dt>
                    <dd className="font-semibold text-navy-950">
                      {pct(item.collection_efficiency_percent)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-600">Service coverage</dt>
                    <dd className="font-semibold text-navy-950">
                      {pct(item.service_coverage_percent)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-600">Meter coverage</dt>
                    <dd className="font-semibold text-navy-950">
                      {pct(item.meter_coverage_percent)}
                    </dd>
                  </div>
                </dl>
                <div className="mt-4 flex flex-wrap gap-2">
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
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
