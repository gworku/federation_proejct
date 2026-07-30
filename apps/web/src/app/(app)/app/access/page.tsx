"use client";

import { StatusInbox } from "@/components/app/status-inbox";
import {
  exportRequestsCsv,
  fetchAccessRequests,
  updateAccessRequest,
} from "@/lib/api";

export default function AccessRequestsPage() {
  return (
    <StatusInbox
      queryKey="access-requests"
      description="Review requests for management-platform access. Approving creates/activates a user account."
      emptyTitle="No access requests"
      emptyDescription="Requests from the public form appear here."
      errorMessage="Unable to load access requests."
      statuses={["pending", "approved", "rejected"]}
      fetchItems={async () => {
        const rows = await fetchAccessRequests();
        return rows.map((item) => ({
          id: item.id,
          status: item.status,
          created_at: item.created_at,
          title: item.full_name,
          meta: `${item.email} · ${item.organization} · ${item.role_requested}`,
          body: item.justification,
          staff_notes: item.staff_notes,
        }));
      }}
      updateStatus={(id, status, extra) =>
        updateAccessRequest(
          id,
          status as "pending" | "approved" | "rejected",
          extra,
        )
      }
      exportCsv={() => exportRequestsCsv("access-requests")}
    />
  );
}
