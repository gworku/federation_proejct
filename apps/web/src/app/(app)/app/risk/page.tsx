"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createRisk, fetchRisks, updateRisk } from "@/lib/api";
import { Badge, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

const categories = [
  "strategic",
  "operational",
  "financial",
  "compliance",
  "reputational",
  "environmental",
  "ict",
  "other",
] as const;

const reviewStatuses = ["open", "monitoring", "mitigated", "closed"] as const;

const schema = z.object({
  title: z.string().min(3, "Enter a title"),
  category: z.enum(categories),
  description: z.string().min(8, "Enter a description"),
  probability: z.coerce.number().min(1).max(5),
  impact: z.coerce.number().min(1).max(5),
  mitigation: z.string().optional(),
  owner: z.string().optional(),
  due_date: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function ratingTone(rating: number): "success" | "warning" | "danger" | "info" {
  if (rating >= 15) return "danger";
  if (rating >= 8) return "warning";
  if (rating >= 4) return "info";
  return "success";
}

function reviewLabel(status: string) {
  return status.replaceAll("_", " ");
}

export default function RiskPage() {
  const queryClient = useQueryClient();
  const { push } = useToast();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["risks"],
    queryFn: fetchRisks,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      title: "",
      category: "operational",
      description: "",
      probability: 3,
      impact: 3,
      mitigation: "",
      owner: "",
      due_date: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: createRisk,
    onSuccess: async () => {
      reset();
      await queryClient.invalidateQueries({ queryKey: ["risks"] });
      push("Risk registered.", "success");
    },
    onError: (error: Error) => push(error.message, "error"),
  });

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      review_status,
    }: {
      id: number;
      review_status: (typeof reviewStatuses)[number];
    }) => updateRisk(id, { review_status }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["risks"] });
      push("Review status updated.", "success");
    },
    onError: (error: Error) => push(error.message, "error"),
  });

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        Register operational and strategic risks, track mitigation owners, and
        update review status through the risk lifecycle.
      </p>

      <form
        onSubmit={handleSubmit((values) => {
          createMutation.mutate({
            title: values.title,
            category: values.category,
            description: values.description,
            probability: values.probability,
            impact: values.impact,
            mitigation: values.mitigation || "",
            owner: values.owner || "",
            due_date: values.due_date || null,
            review_status: "open",
          });
        })}
        className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-sm"
        noValidate
      >
        <div>
          <h2 className="font-display text-xl text-navy-950">Register risk</h2>
          <p className="mt-1 text-sm text-slate-600">
            Rating is probability × impact (1–25).
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="title" className="mb-1.5 block text-sm font-semibold">
              Title <span className="text-danger">*</span>
            </label>
            <Input id="title" {...register("title")} />
            {errors.title ? (
              <p className="mt-1 text-xs text-danger">{errors.title.message}</p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="category"
              className="mb-1.5 block text-sm font-semibold"
            >
              Category
            </label>
            <select
              id="category"
              className="h-11 w-full rounded-xl border border-border bg-white px-3.5 text-sm focus-ring"
              {...register("category")}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="owner" className="mb-1.5 block text-sm font-semibold">
              Owner
            </label>
            <Input id="owner" {...register("owner")} />
          </div>

          <div>
            <label
              htmlFor="probability"
              className="mb-1.5 block text-sm font-semibold"
            >
              Probability (1–5)
            </label>
            <Input
              id="probability"
              type="number"
              min={1}
              max={5}
              {...register("probability")}
            />
          </div>

          <div>
            <label htmlFor="impact" className="mb-1.5 block text-sm font-semibold">
              Impact (1–5)
            </label>
            <Input
              id="impact"
              type="number"
              min={1}
              max={5}
              {...register("impact")}
            />
          </div>

          <div>
            <label
              htmlFor="due_date"
              className="mb-1.5 block text-sm font-semibold"
            >
              Due date
            </label>
            <Input id="due_date" type="date" {...register("due_date")} />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="description"
              className="mb-1.5 block text-sm font-semibold"
            >
              Description <span className="text-danger">*</span>
            </label>
            <textarea
              id="description"
              rows={3}
              className="w-full rounded-xl border border-border px-3.5 py-3 text-sm focus-ring"
              {...register("description")}
            />
            {errors.description ? (
              <p className="mt-1 text-xs text-danger">
                {errors.description.message}
              </p>
            ) : null}
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="mitigation"
              className="mb-1.5 block text-sm font-semibold"
            >
              Mitigation
            </label>
            <textarea
              id="mitigation"
              rows={2}
              className="w-full rounded-xl border border-border px-3.5 py-3 text-sm focus-ring"
              {...register("mitigation")}
            />
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
          {createMutation.isPending ? "Saving…" : "Create risk"}
        </Button>
      </form>

      {isError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
          Unable to load risks. Administrator, management, or auditor access is
          required.
        </p>
      ) : null}

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : !data?.length ? (
        <EmptyState
          title="No risks registered"
          description="Create the first risk entry using the form above."
        />
      ) : (
        <div className="space-y-3">
          {data.map((item) => {
            const rating = item.rating ?? item.probability * item.impact;
            return (
              <article
                key={item.id}
                className="rounded-2xl border border-border bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl text-navy-950">
                      {item.title}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      {item.category.replaceAll("_", " ")}
                      {item.owner ? ` · Owner: ${item.owner}` : ""}
                      {item.due_date
                        ? ` · Due ${new Date(item.due_date).toLocaleDateString()}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={ratingTone(rating)}>Rating {rating}</Badge>
                    <Badge tone={statusTone(reviewLabel(item.review_status))}>
                      {reviewLabel(item.review_status)}
                    </Badge>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-600">{item.description}</p>
                {item.mitigation ? (
                  <p className="mt-2 text-sm text-slate-600">
                    <span className="font-semibold text-navy-950">Mitigation:</span>{" "}
                    {item.mitigation}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-slate-600">
                  P{item.probability} × I{item.impact} · Updated{" "}
                  {new Date(item.updated_at).toLocaleString()}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {reviewStatuses
                    .filter((status) => status !== item.review_status)
                    .map((status) => (
                      <button
                        key={status}
                        type="button"
                        className="rounded-xl border border-ocean-600/30 px-4 py-2 text-sm font-semibold text-ocean-700 hover:bg-sky-50 focus-ring"
                        onClick={() =>
                          statusMutation.mutate({
                            id: item.id,
                            review_status: status,
                          })
                        }
                      >
                        {reviewLabel(status)}
                      </button>
                    ))}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
