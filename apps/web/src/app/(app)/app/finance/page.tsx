"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  absoluteMediaUrl,
  createContribution,
  fetchContributions,
  fetchContributionSummary,
  recordContributionPayment,
  reviewContributionPayment,
  submitContributionPayment,
  uploadCmsMedia,
  type ContributionItem,
} from "@/lib/api";
import { getSession } from "@/lib/auth";
import { Badge, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

const invoiceSchema = z.object({
  organization_name: z.string().min(2, "Enter the utility name"),
  invoice_number: z.string().min(2, "Enter an invoice number"),
  period_label: z.string().min(2, "Enter the contribution period"),
  amount: z.string().refine((value) => Number(value) > 0, "Amount must be greater than zero"),
  due_at: z.string().optional(),
});

const paymentSchema = z.object({
  contribution: z.string().refine((value) => Number(value) > 0, "Select an invoice"),
  amount: z.string().refine((value) => Number(value) > 0, "Amount must be greater than zero"),
  paid_at: z.string().min(1, "Enter the payment date"),
  reference: z.string().min(2, "Enter the bank or transaction reference"),
  method: z.enum(["bank_transfer", "mobile_money", "cash", "other"]),
  notes: z.string().optional(),
});

type InvoiceValues = z.infer<typeof invoiceSchema>;
type PaymentValues = z.infer<typeof paymentSchema>;
type UploadedFile = { url: string; name: string };

function money(value: string | number, currency = "ETB") {
  return `${Number(value).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })} ${currency}`;
}

function Attachment({
  url,
  name,
  label,
}: {
  url?: string | null;
  name?: string | null;
  label: string;
}) {
  const href = absoluteMediaUrl(url);
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm font-semibold text-ocean-700 hover:underline"
    >
      {label}
      {name ? ` · ${name}` : ""}
    </a>
  );
}

export default function FinancePage() {
  const queryClient = useQueryClient();
  const { push } = useToast();
  const isUtility = getSession()?.role === "utility_user";
  const [invoiceFile, setInvoiceFile] = useState<UploadedFile | null>(null);
  const [receiptFile, setReceiptFile] = useState<UploadedFile | null>(null);
  const [uploading, setUploading] = useState<"invoice" | "receipt" | null>(null);

  const summaryQuery = useQuery({
    queryKey: ["contribution-summary"],
    queryFn: fetchContributionSummary,
  });
  const contributionsQuery = useQuery({
    queryKey: ["contributions"],
    queryFn: fetchContributions,
  });

  const invoiceForm = useForm<InvoiceValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      organization_name: "",
      invoice_number: "",
      period_label: "",
      amount: "",
      due_at: "",
    },
  });
  const paymentForm = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      contribution: "0",
      amount: "",
      paid_at: "",
      reference: "",
      method: "bank_transfer",
      notes: "",
    },
  });

  async function refresh() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["contributions"] }),
      queryClient.invalidateQueries({ queryKey: ["contribution-summary"] }),
    ]);
  }

  async function upload(file: File, folder: "invoices" | "receipts") {
    setUploading(folder === "invoices" ? "invoice" : "receipt");
    try {
      const result = await uploadCmsMedia(file, folder);
      const uploaded = { url: result.url, name: result.name || file.name };
      if (folder === "invoices") setInvoiceFile(uploaded);
      else setReceiptFile(uploaded);
      push(`${folder === "invoices" ? "Invoice" : "Payment proof"} uploaded.`, "success");
    } catch (error) {
      push(error instanceof Error ? error.message : "Upload failed.", "error");
    } finally {
      setUploading(null);
    }
  }

  const invoiceMutation = useMutation({
    mutationFn: createContribution,
    onSuccess: async () => {
      invoiceForm.reset();
      setInvoiceFile(null);
      await refresh();
      push("Contribution invoice created.", "success");
    },
    onError: (error: Error) => push(error.message, "error"),
  });

  const paymentMutation = useMutation({
    mutationFn: (values: PaymentValues) => {
      if (!receiptFile) throw new Error("Upload the bank slip or payment receipt.");
      const payload = {
        ...values,
        contribution: Number(values.contribution),
        receipt_url: receiptFile.url,
        receipt_name: receiptFile.name,
      };
      return isUtility
        ? submitContributionPayment(payload)
        : recordContributionPayment(payload);
    },
    onSuccess: async () => {
      paymentForm.reset();
      setReceiptFile(null);
      await refresh();
      push(
        isUtility
          ? "Contribution submitted for finance review."
          : "Contribution payment recorded.",
        "success",
      );
    },
    onError: (error: Error) => push(error.message, "error"),
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      paymentId,
      status,
      reviewNotes,
    }: {
      paymentId: number;
      status: "approved" | "rejected";
      reviewNotes?: string;
    }) =>
      reviewContributionPayment(paymentId, {
        status,
        review_notes: reviewNotes,
      }),
    onSuccess: async (_, variables) => {
      await refresh();
      push(`Payment ${variables.status}.`, "success");
    },
    onError: (error: Error) => push(error.message, "error"),
  });

  const invoices = contributionsQuery.data ?? [];
  const payableInvoices = invoices.filter(
    (item) => !["paid", "cancelled", "waived"].includes(item.status),
  );
  const pendingCount = invoices.reduce(
    (count, item) =>
      count + (item.payments ?? []).filter((payment) => payment.status === "pending").length,
    0,
  );

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-gradient-to-r from-navy-950 to-ocean-700 p-6 text-white shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">
          Membership finance
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold">
          {isUtility ? "Send your utility contribution" : "Contribution management"}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-sky-100">
          {isUtility
            ? "Select an issued invoice, enter the transfer details, and upload payment proof. Finance staff will verify it before your balance is updated."
            : "Issue contribution invoices, record payments, and verify payment evidence submitted by member utilities."}
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Invoices", summaryQuery.data?.total ?? 0],
          ["Issued", summaryQuery.data?.issued ?? 0],
          ["Paid", summaryQuery.data?.paid ?? 0],
          ["Overdue", summaryQuery.data?.overdue ?? 0],
          ["Pending review", pendingCount],
        ].map(([label, value]) => (
          <article key={String(label)} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">{label}</p>
            {summaryQuery.isLoading ? (
              <Skeleton className="mt-3 h-9 w-16" />
            ) : (
              <p className="mt-2 font-display text-3xl font-semibold text-ocean-700">
                {Number(value).toLocaleString()}
              </p>
            )}
          </article>
        ))}
      </section>

      <div className="rounded-2xl border border-ocean-100 bg-ocean-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-ocean-700">Outstanding balance</p>
        <p className="mt-1 font-display text-3xl font-semibold text-navy-950">
          {money(summaryQuery.data?.outstanding_amount ?? 0)}
        </p>
      </div>

      <section className={`grid gap-6 ${isUtility ? "" : "xl:grid-cols-2"}`}>
        {!isUtility ? (
          <form
            className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-sm"
            onSubmit={invoiceForm.handleSubmit((values) =>
              invoiceMutation.mutate({
                ...values,
                due_at: values.due_at || null,
                status: "issued",
                attachment_url: invoiceFile?.url ?? "",
                attachment_name: invoiceFile?.name ?? "",
              }),
            )}
          >
            <div>
              <h2 className="font-display text-xl text-navy-950">Create contribution invoice</h2>
              <p className="mt-1 text-sm text-slate-600">Issue the amount a member utility is expected to pay.</p>
            </div>
            <Field label="Utility or organization" error={invoiceForm.formState.errors.organization_name?.message}>
              <Input {...invoiceForm.register("organization_name")} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Invoice number" error={invoiceForm.formState.errors.invoice_number?.message}>
                <Input {...invoiceForm.register("invoice_number")} />
              </Field>
              <Field label="Period" error={invoiceForm.formState.errors.period_label?.message}>
                <Input placeholder="FY 2026/27" {...invoiceForm.register("period_label")} />
              </Field>
              <Field label="Amount (ETB)" error={invoiceForm.formState.errors.amount?.message}>
                <Input type="number" min="0.01" step="0.01" {...invoiceForm.register("amount")} />
              </Field>
              <Field label="Due date">
                <Input type="date" {...invoiceForm.register("due_at")} />
              </Field>
            </div>
            <FileField
              label="Invoice attachment"
              busy={uploading === "invoice"}
              file={invoiceFile}
              onFile={(file) => upload(file, "invoices")}
            />
            <Button disabled={invoiceMutation.isPending || uploading === "invoice"}>
              {invoiceMutation.isPending ? "Creating…" : "Create invoice"}
            </Button>
          </form>
        ) : null}

        <form
          className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-sm"
          onSubmit={paymentForm.handleSubmit((values) => paymentMutation.mutate(values))}
        >
          <div>
            <h2 className="font-display text-xl text-navy-950">
              {isUtility ? "Submit contribution payment" : "Record a verified payment"}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {isUtility
                ? "A bank slip or transaction receipt is required."
                : "Use this for payments already verified by finance staff."}
            </p>
          </div>
          <Field label="Contribution invoice" error={paymentForm.formState.errors.contribution?.message}>
            <select
              className="h-11 w-full rounded-xl border border-border bg-white px-3.5 text-sm focus-ring"
              {...paymentForm.register("contribution")}
            >
              <option value="0">Select invoice</option>
              {payableInvoices.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.invoice_number} · {item.period_label} · {money(item.balance, item.currency)}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Amount paid" error={paymentForm.formState.errors.amount?.message}>
              <Input type="number" min="0.01" step="0.01" {...paymentForm.register("amount")} />
            </Field>
            <Field label="Payment date" error={paymentForm.formState.errors.paid_at?.message}>
              <Input type="date" max={new Date().toISOString().slice(0, 10)} {...paymentForm.register("paid_at")} />
            </Field>
            <Field label="Transaction reference" error={paymentForm.formState.errors.reference?.message}>
              <Input placeholder="Bank reference / transaction ID" {...paymentForm.register("reference")} />
            </Field>
            <Field label="Payment method">
              <select
                className="h-11 w-full rounded-xl border border-border bg-white px-3.5 text-sm focus-ring"
                {...paymentForm.register("method")}
              >
                <option value="bank_transfer">Bank transfer</option>
                <option value="mobile_money">Mobile money</option>
                <option value="cash">Cash deposit</option>
                <option value="other">Other</option>
              </select>
            </Field>
          </div>
          <Field label="Notes">
            <textarea
              className="min-h-24 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm focus-ring"
              placeholder="Optional information for finance staff"
              {...paymentForm.register("notes")}
            />
          </Field>
          <FileField
            label="Payment proof"
            busy={uploading === "receipt"}
            file={receiptFile}
            onFile={(file) => upload(file, "receipts")}
          />
          <Button disabled={paymentMutation.isPending || uploading === "receipt"}>
            {paymentMutation.isPending
              ? "Submitting…"
              : isUtility
                ? "Send contribution for review"
                : "Record payment"}
          </Button>
        </form>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-display text-xl text-navy-950">
            {isUtility ? "Your contribution history" : "Contribution invoices"}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Pending submissions do not change the paid balance until finance staff approve them.
          </p>
        </div>
        {contributionsQuery.isLoading ? (
          <><Skeleton className="h-28" /><Skeleton className="h-28" /></>
        ) : contributionsQuery.isError ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
            Unable to load contribution records.
          </p>
        ) : invoices.length === 0 ? (
          <EmptyState title="No contribution invoices" description="There are no contribution invoices available for this utility." />
        ) : (
          invoices.map((item) => (
            <ContributionCard
              key={item.id}
              item={item}
              canReview={!isUtility}
              reviewing={reviewMutation.isPending}
              onReview={(paymentId, status) => {
                let reviewNotes = "";
                if (status === "rejected") {
                  const reason = window.prompt("Reason for rejecting this payment proof:");
                  if (reason === null) return;
                  reviewNotes = reason;
                }
                reviewMutation.mutate({ paymentId, status, reviewNotes });
              }}
            />
          ))
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-semibold text-navy-950">
      <span className="mb-1.5 block">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-danger">{error}</span> : null}
    </label>
  );
}

function FileField({
  label,
  busy,
  file,
  onFile,
}: {
  label: string;
  busy: boolean;
  file: UploadedFile | null;
  onFile: (file: File) => void;
}) {
  return (
    <Field label={label}>
      <Input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        disabled={busy}
        onChange={(event) => {
          const selected = event.target.files?.[0];
          if (selected) onFile(selected);
          event.target.value = "";
        }}
      />
      <span className="mt-1 block text-xs font-normal text-slate-500">
        PDF or image, up to 10 MB. {busy ? "Uploading…" : file ? `Attached: ${file.name}` : ""}
      </span>
    </Field>
  );
}

function ContributionCard({
  item,
  canReview,
  reviewing,
  onReview,
}: {
  item: ContributionItem;
  canReview: boolean;
  reviewing: boolean;
  onReview: (paymentId: number, status: "approved" | "rejected") => void;
}) {
  return (
    <article className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg text-navy-950">{item.invoice_number}</h3>
          <p className="mt-1 text-sm text-slate-600">
            {item.organization_name} · {item.period_label}
          </p>
        </div>
        <Badge tone={statusTone(item.status)}>{item.status.replaceAll("_", " ")}</Badge>
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div><dt className="text-xs text-slate-500">Invoice amount</dt><dd className="font-semibold">{money(item.amount, item.currency)}</dd></div>
        <div><dt className="text-xs text-slate-500">Approved paid</dt><dd className="font-semibold">{money(item.amount_paid, item.currency)}</dd></div>
        <div><dt className="text-xs text-slate-500">Balance</dt><dd className="font-semibold">{money(item.balance, item.currency)}</dd></div>
      </dl>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        {item.due_at ? <span className="text-xs text-slate-600">Due {new Date(item.due_at).toLocaleDateString()}</span> : null}
        <Attachment url={item.attachment_url} name={item.attachment_name} label="View invoice" />
      </div>
      {(item.payments ?? []).length > 0 ? (
        <div className="mt-4 space-y-3 border-t border-border pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Payment submissions</p>
          {(item.payments ?? []).map((payment) => (
            <div key={payment.id} className="rounded-xl border border-border bg-slate-50 p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-navy-950">{money(payment.amount, item.currency)}</p>
                  <p className="mt-1 text-xs text-slate-600">
                    {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : "No date"}
                    {payment.reference ? ` · Ref ${payment.reference}` : ""}
                    {payment.method ? ` · ${payment.method.replaceAll("_", " ")}` : ""}
                  </p>
                </div>
                <Badge tone={statusTone(payment.status)}>{payment.status}</Badge>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <Attachment url={payment.receipt_url} name={payment.receipt_name} label="View payment proof" />
                {payment.review_notes ? <span className="text-xs text-slate-600">Review: {payment.review_notes}</span> : null}
              </div>
              {canReview && payment.status === "pending" ? (
                <div className="mt-3 flex gap-2">
                  <Button type="button" size="sm" disabled={reviewing} onClick={() => onReview(payment.id, "approved")}>
                    Approve
                  </Button>
                  <Button type="button" size="sm" variant="outline" disabled={reviewing} onClick={() => onReview(payment.id, "rejected")}>
                    Reject
                  </Button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}
