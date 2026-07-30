"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { uploadCmsMedia } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

export type CmsField = {
  name: string;
  label: string;
  type?:
    | "text"
    | "textarea"
    | "select"
    | "number"
    | "datetime-local"
    | "checkbox"
    | "file";
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
  placeholder?: string;
  /** Media folder hint for file uploads */
  folder?: string;
  accept?: string;
};

type Row = Record<string, unknown> & { id?: number; slug?: string; key?: string };

export function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function toDatetimeLocal(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(value: string) {
  if (!value) return null;
  return new Date(value).toISOString();
}

export function CmsCrudPanel<T extends Row>({
  queryKey,
  title,
  description,
  fields,
  defaults,
  columns,
  listFn,
  createFn,
  updateFn,
  deleteFn,
  getId,
  prepareCreate,
  prepareUpdate,
}: {
  queryKey: string;
  title: string;
  description: string;
  fields: CmsField[];
  defaults: Record<string, string | number | boolean>;
  columns: Array<{ key: string; label: string }>;
  listFn: () => Promise<T[]>;
  createFn: (payload: Record<string, unknown>) => Promise<unknown>;
  updateFn: (id: string | number, payload: Record<string, unknown>) => Promise<unknown>;
  deleteFn: (id: string | number) => Promise<unknown>;
  getId: (row: T) => string | number;
  prepareCreate?: (values: Record<string, string | number | boolean>) => Record<string, unknown>;
  prepareUpdate?: (values: Record<string, string | number | boolean>) => Record<string, unknown>;
}) {
  const queryClient = useQueryClient();
  const { push } = useToast();
  const [form, setForm] = useState(defaults);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | number | null>(
    null,
  );

  const listQuery = useQuery({
    queryKey: [queryKey],
    queryFn: listFn,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const mapped: Record<string, string | number | boolean> = { ...form };
      for (const field of fields) {
        if (field.type === "datetime-local") {
          const iso = fromDatetimeLocal(String(form[field.name] ?? ""));
          mapped[field.name] = (iso ?? "") as string;
        }
        if (field.type === "number") {
          mapped[field.name] = Number(form[field.name] || 0);
        }
      }
      const payload = editingId
        ? (prepareUpdate?.(mapped) ?? mapped)
        : (prepareCreate?.(mapped) ?? mapped);
      if (editingId != null) {
        return updateFn(editingId, payload);
      }
      return createFn(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [queryKey] });
      setForm(defaults);
      setEditingId(null);
      push(editingId != null ? "Item updated." : "Item created.", "success");
    },
    onError: (error: Error) => push(error.message, "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [queryKey] });
      setPendingDeleteId(null);
      push("Item deleted.", "success");
    },
    onError: (error: Error) => push(error.message, "error"),
  });

  async function onUpload(field: CmsField, file: File | null) {
    if (!file) return;
    setUploadingField(field.name);
    try {
      const result = await uploadCmsMedia(file, field.folder ?? "uploads");
      setForm((prev) => ({ ...prev, [field.name]: result.url }));
      push("File uploaded.", "success");
    } catch (error) {
      push(error instanceof Error ? error.message : "Upload failed.", "error");
    } finally {
      setUploadingField(null);
    }
  }

  function startEdit(row: T) {
    const next: Record<string, string | number | boolean> = { ...defaults };
    for (const field of fields) {
      const raw = row[field.name];
      if (field.type === "datetime-local") {
        next[field.name] = toDatetimeLocal(
          typeof raw === "string" ? raw : null,
        );
      } else if (field.type === "checkbox") {
        next[field.name] = Boolean(raw);
      } else if (field.type === "number") {
        next[field.name] = typeof raw === "number" ? raw : Number(raw ?? 0);
      } else {
        next[field.name] = raw == null ? "" : String(raw);
      }
    }
    setForm(next);
    setEditingId(getId(row));
  }

  const rows = listQuery.data ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl text-navy-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>

      <form
        className="grid gap-3 rounded-2xl border border-border bg-white p-5 shadow-sm md:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          saveMutation.mutate();
        }}
      >
        {fields.map((field) => (
          <label
            key={field.name}
            className={
              field.type === "textarea" ||
              field.type === "file" ||
              field.name === "summary"
                ? "md:col-span-2"
                : ""
            }
          >
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              {field.label}
            </span>
            {field.type === "textarea" ? (
              <textarea
                className="min-h-24 w-full rounded-xl border border-border px-3 py-2 text-sm"
                required={field.required}
                value={String(form[field.name] ?? "")}
                placeholder={field.placeholder}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [field.name]: e.target.value }))
                }
              />
            ) : field.type === "select" ? (
              <select
                className="w-full rounded-xl border border-border px-3 py-2 text-sm"
                required={field.required}
                value={String(form[field.name] ?? "")}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [field.name]: e.target.value }))
                }
              >
                {(field.options ?? []).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : field.type === "checkbox" ? (
              <input
                type="checkbox"
                className="mt-2 h-4 w-4"
                checked={Boolean(form[field.name])}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    [field.name]: e.target.checked,
                  }))
                }
              />
            ) : field.type === "file" ? (
              <div className="space-y-2">
                <Input
                  type="text"
                  required={field.required}
                  placeholder={field.placeholder ?? "Upload a file or paste a URL"}
                  value={String(form[field.name] ?? "")}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, [field.name]: e.target.value }))
                  }
                />
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    accept={field.accept ?? "image/*,.pdf,.doc,.docx,.xls,.xlsx"}
                    className="block w-full max-w-md text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-ocean-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-ocean-500"
                    disabled={uploadingField === field.name}
                    onChange={(e) => onUpload(field, e.target.files?.[0] ?? null)}
                  />
                  {uploadingField === field.name ? (
                    <span className="text-xs font-semibold text-ocean-700">
                      Uploading…
                    </span>
                  ) : null}
                </div>
              </div>
            ) : (
              <Input
                type={
                  field.type === "number"
                    ? "number"
                    : field.type === "datetime-local"
                      ? "datetime-local"
                      : "text"
                }
                required={field.required}
                placeholder={field.placeholder}
                value={String(form[field.name] ?? "")}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [field.name]: e.target.value }))
                }
              />
            )}
          </label>
        ))}
        <div className="flex flex-wrap gap-2 md:col-span-2">
          <Button type="submit" disabled={saveMutation.isPending || !!uploadingField}>
            {editingId != null ? "Update" : "Create"}
          </Button>
          {editingId != null ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingId(null);
                setForm(defaults);
              }}
            >
              Cancel edit
            </Button>
          ) : null}
        </div>
      </form>

      {listQuery.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : !rows.length ? (
        <EmptyState title={`No ${title.toLowerCase()} yet`} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-sky-50">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className="px-4 py-3 font-semibold">
                    {col.label}
                  </th>
                ))}
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={String(getId(row))} className="border-t border-border">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-slate-700">
                      {String(row[col.key] ?? "—")}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(row)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        onClick={() => setPendingDeleteId(getId(row))}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={pendingDeleteId != null}
        title="Delete this item?"
        description="The item will be removed from public listings. Soft-deleted CMS records can be recovered by an administrator if needed."
        confirmLabel="Delete"
        danger
        pending={deleteMutation.isPending}
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (pendingDeleteId != null) deleteMutation.mutate(pendingDeleteId);
        }}
      />
    </div>
  );
}
