"use client";

import { StatusInbox } from "@/components/app/status-inbox";
import {
  exportRequestsCsv,
  fetchEventRegistrations,
  updateEventRegistration,
} from "@/lib/api";

export default function EventRegistrationsPage() {
  return (
    <StatusInbox
      queryKey="event-registrations"
      description="Event registrations from the public site."
      emptyTitle="No event registrations yet"
      emptyDescription="Registrations from /events appear here."
      errorMessage="Unable to load event registrations."
      statuses={["registered", "waitlisted", "cancelled", "attended"]}
      fetchItems={async () => {
        const rows = await fetchEventRegistrations();
        return rows.map((item) => ({
          id: item.id,
          status: item.status,
          created_at: item.created_at,
          title: item.name,
          meta: `${item.email} · ${item.organization || "—"} · ${item.event_title}`,
          body: item.phone || undefined,
          staff_notes: item.staff_notes,
        }));
      }}
      updateStatus={updateEventRegistration}
      exportCsv={() => exportRequestsCsv("event-registrations")}
    />
  );
}
