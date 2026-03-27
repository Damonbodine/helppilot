"use client";


import { useParams } from "next/navigation";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { SatisfactionRatingForm } from "@/components/satisfaction-rating-form";

export default function RateTicketPage() {
  const params = useParams();
  const ticketId = params.id as Id<"tickets">;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Rate Your Experience</h1>
      <p className="text-sm text-muted-foreground">Tell us how we did on this ticket</p>
      <SatisfactionRatingForm ticketId={ticketId} />
    </div>
  );
}
