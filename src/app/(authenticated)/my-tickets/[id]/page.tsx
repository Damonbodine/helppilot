"use client";


import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "../../../../../convex/_generated/dataModel";
import { StatusBadge } from "@/components/status-badge";
import { PriorityBadge } from "@/components/priority-badge";
import { TicketTimeline } from "@/components/ticket-timeline";
import { TicketReplyForm } from "@/components/ticket-reply-form";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MyTicketDetailPage() {
  const params = useParams();
  const ticketId = params.id as Id<"tickets">;
  const user = useQuery(api.users.getCurrentUser);
  const ticket = useQuery(api.tickets.getById, user === undefined ? "skip" : { ticketId });

  if (ticket === undefined) return <LoadingSkeleton type="detail" />;
  if (!ticket) return <div className="text-center py-12">Ticket not found</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle>{ticket.title}</CardTitle>
            <div className="flex gap-2"><StatusBadge status={ticket.status} /><PriorityBadge priority={ticket.priority} /></div>
          </div>
          <p className="text-xs text-muted-foreground">Created {new Date(ticket.createdAt).toLocaleDateString()}</p>
        </CardHeader>
        <CardContent><p className="text-sm whitespace-pre-wrap">{ticket.description}</p></CardContent>
      </Card>
      <h2 className="text-lg font-semibold">Replies</h2>
      <TicketTimeline ticketId={ticketId} />
      {ticket.status !== "Closed" && <TicketReplyForm ticketId={ticketId} />}
    </div>
  );
}
