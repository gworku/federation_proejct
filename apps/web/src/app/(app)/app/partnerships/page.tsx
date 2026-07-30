"use client";

import { StatusInbox } from "@/components/app/status-inbox";
import {
  exportRequestsCsv,
  fetchPartnershipInquiries,
  updatePartnershipInquiry,
} from "@/lib/api";

export default function PartnershipsInboxPage() {
  return (
    <StatusInbox
      queryKey="partnership-inquiries"
      description="Partnership inquiries from the public site. Process status, notes, and CSV reports."
      emptyTitle="No partnership inquiries yet"
      emptyDescription="Inquiries from /partnerships appear here."
      errorMessage="Unable to load partnership inquiries."
      fetchItems={async () => {
        const rows = await fetchPartnershipInquiries();
        return rows.map((item) => ({
          id: item.id,
          status: item.status,
          created_at: item.created_at,
          title: item.partnership_interest,
          meta: `${item.contact_name} · ${item.email} · ${item.organization}`,
          body: item.message,
          staff_notes: item.staff_notes,
        }));
      }}
      updateStatus={(id, status, extra) =>
        updatePartnershipInquiry(
          id,
          status as "new" | "in_progress" | "closed",
          extra,
        )
      }
      exportCsv={() => exportRequestsCsv("partnership-inquiries")}
    />
  );
}
