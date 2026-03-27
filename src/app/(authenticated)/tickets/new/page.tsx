"use client";

import { NewTicketForm } from "@/components/new-ticket-form";

export default function NewTicketPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Submit New Ticket</h1>
        <p className="text-sm text-muted-foreground">Describe your issue and we will help you resolve it</p>
      </div>
      <NewTicketForm />
    </div>
  );
}
