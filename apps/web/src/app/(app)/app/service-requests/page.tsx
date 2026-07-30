"use client";

import { StatusInbox } from "@/components/app/status-inbox";
import {
  deleteServiceRequest,
  exportRequestsCsv,
  fetchServiceRequests,
  updateServiceRequest,
} from "@/lib/api";

export default function ServiceRequestsPage() {
  return (
    <StatusInbox
      queryKey="service-requests"
      description="End-user technical support requests. Process status, add staff notes, and export reports. All submissions come from the public Technical Support form into this backend queue."
      emptyTitle="No service requests yet"
      emptyDescription="Requests submitted by members on the public website appear here for processing."
      errorMessage="Unable to load service requests."
      fetchItems={async () => {
        const rows = await fetchServiceRequests();
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
        updateServiceRequest(
          id,
          status as "new" | "in_progress" | "closed",
          extra,
        )
      }
      deleteItem={(id) => deleteServiceRequest(id)}
      exportCsv={() => exportRequestsCsv("service-requests")}
    />
  );
}
