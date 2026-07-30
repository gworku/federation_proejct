"use client";

import { StatusInbox } from "@/components/app/status-inbox";
import {
  exportRequestsCsv,
  fetchMembershipApplications,
  updateMembershipApplication,
} from "@/lib/api";

export default function MembershipInboxPage() {
  return (
    <StatusInbox
      queryKey="membership-applications"
      description="Membership applications from the public site. Review, approve/reject, add notes, and export."
      emptyTitle="No membership applications yet"
      emptyDescription="Applications from /membership appear here."
      errorMessage="Unable to load membership applications."
      statuses={["pending", "under_review", "approved", "rejected"]}
      fetchItems={async () => {
        const rows = await fetchMembershipApplications();
        return rows.map((item) => ({
          id: item.id,
          status: item.status,
          created_at: item.created_at,
          title: item.organization_name,
          meta: `${item.contact_name} · ${item.email} · ${item.category}`,
          body: item.justification,
          staff_notes: item.staff_notes,
        }));
      }}
      updateStatus={(id, status, extra) =>
        updateMembershipApplication(
          id,
          status as "pending" | "under_review" | "approved" | "rejected",
          extra,
        )
      }
      exportCsv={() => exportRequestsCsv("membership-applications")}
    />
  );
}
