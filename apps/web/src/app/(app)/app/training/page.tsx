"use client";

import { StatusInbox } from "@/components/app/status-inbox";
import {
  exportRequestsCsv,
  fetchTrainingRegistrations,
  updateTrainingRegistration,
} from "@/lib/api";

export default function TrainingInboxPage() {
  return (
    <StatusInbox
      queryKey="training-registrations"
      description="Training course registrations."
      emptyTitle="No training registrations yet"
      emptyDescription="Registrations from capacity-building pages appear here."
      errorMessage="Unable to load training registrations."
      statuses={["registered", "waitlisted", "cancelled", "attended", "certified"]}
      fetchItems={async () => {
        const rows = await fetchTrainingRegistrations();
        return rows.map((item) => ({
          id: item.id,
          status: item.status,
          created_at: item.created_at,
          title: item.name,
          meta: `${item.email} · ${item.organization || "—"} · ${item.course_title}`,
          body: item.phone || undefined,
          staff_notes: item.staff_notes,
        }));
      }}
      updateStatus={updateTrainingRegistration}
      exportCsv={() => exportRequestsCsv("training-registrations")}
    />
  );
}