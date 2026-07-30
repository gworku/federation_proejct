"use client";

import { StatusInbox } from "@/components/app/status-inbox";
import {
  exportRequestsCsv,
  fetchConsultancyRequests,
  updateConsultancyRequest,
} from "@/lib/api";

export default function ConsultancyInboxPage() {
  return (
    <StatusInbox
      queryKey="consultancy-requests"
      description="Consultancy requests from the public site. Process, note, and report from the backend queue."
      emptyTitle="No consultancy requests yet"
      emptyDescription="Requests from /consultancy appear here."
      errorMessage="Unable to load consultancy requests."
      fetchItems={async () => {
        const rows = await fetchConsultancyRequests();
        return rows.map((item) => ({
          id: item.id,
          status: item.status,
          created_at: item.created_at,
          title: item.subject,
          meta: `${item.name} · ${item.email} · ${item.organization}`,
          body: item.description,
          badge: item.category.replaceAll("_", " "),
          staff_notes: item.staff_notes,
        }));
      }}
      updateStatus={(id, status, extra) =>
        updateConsultancyRequest(
          id,
          status as "new" | "in_progress" | "closed",
          extra,
        )
      }
      exportCsv={() => exportRequestsCsv("consultancy-requests")}
    />
  );
}
