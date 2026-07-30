"use client";

import { StatusInbox } from "@/components/app/status-inbox";
import {
  deleteContactMessage,
  exportRequestsCsv,
  fetchContactMessages,
  updateContactMessage,
} from "@/lib/api";

export default function MessagesPage() {
  return (
    <StatusInbox
      queryKey="contact-messages"
      description="Public contact form submissions. Process status, add staff notes, and export."
      emptyTitle="No messages yet"
      emptyDescription="Messages from the Contact page appear here."
      errorMessage="Unable to load messages."
      fetchItems={async () => {
        const rows = await fetchContactMessages();
        return rows.map((item) => ({
          id: item.id,
          status: item.status,
          created_at: item.created_at,
          title: item.subject,
          meta: `${item.name} · ${item.email}`,
          body: item.message,
          staff_notes: item.staff_notes,
        }));
      }}
      updateStatus={(id, status, extra) =>
        updateContactMessage(
          id,
          status as "new" | "in_progress" | "closed",
          extra,
        )
      }
      deleteItem={deleteContactMessage}
      exportCsv={() => exportRequestsCsv("contact")}
    />
  );
}
