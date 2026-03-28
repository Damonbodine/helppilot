"use client";


import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { Id } from "../../../../../convex/_generated/dataModel";
import { StatusBadge } from "@/components/status-badge";
import { PriorityBadge } from "@/components/priority-badge";
import { SlaCountdown } from "@/components/sla-countdown";
import { TicketTimeline } from "@/components/ticket-timeline";
import { TicketReplyForm } from "@/components/ticket-reply-form";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { AiTriageSuggestions } from "@/components/ai-triage-suggestions";
import { ResolutionSuggester } from "@/components/resolution-suggester";
import { AutoResponseDrafter } from "@/components/auto-response-drafter";
import { KbArticleGenerator } from "@/components/kb-article-generator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as Id<"tickets">;
  const user = useQuery(api.users.getCurrentUser);
  const ticket = useQuery(api.tickets.getById, user === undefined ? "skip" : { ticketId });
  const categories = useQuery(api.categories.list, user === undefined ? "skip" : {});
  const agents = useQuery(api.agents.list, user === undefined ? "skip" : {});
  const updateStatus = useMutation(api.tickets.updateStatus);
  const [newStatus, setNewStatus] = useState("");

  if (ticket === undefined) return <LoadingSkeleton type="detail" />;
  if (ticket === null) return <div className="text-center py-12 text-muted-foreground">Ticket not found</div>;

  const category = categories?.find(c => c._id === ticket.categoryId);
  const agent = ticket.assignedAgentId ? agents?.find(a => a._id === ticket.assignedAgentId) : null;
  const isStaff = user?.role !== "Requester";

  const handleStatusChange = async () => {
    if (!newStatus) return;
    await updateStatus({ ticketId, status: newStatus as any });
    setNewStatus("");
  };

  return (
    <div className="space-y-6 max-w-4xl" data-demo="ticket-detail">
      {isStaff && (ticket.status === "Open" || ticket.status === "Triaged") && (
        <AiTriageSuggestions ticketId={ticketId} title={ticket.title} description={ticket.description} />
      )}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{ticket.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">#{ticket._id.slice(-6)} · Created {new Date(ticket.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-muted-foreground">Category:</span> <span className="font-medium">{category?.name ?? "—"}</span></div>
            <div><span className="text-muted-foreground">Agent:</span> <span className="font-medium">{agent?.userId?.slice(0, 8) ?? "Unassigned"}</span></div>
            <div><span className="text-muted-foreground">Response SLA:</span> <SlaCountdown deadline={ticket.slaResponseDeadline} /></div>
            <div><span className="text-muted-foreground">Resolution SLA:</span> <SlaCountdown deadline={ticket.slaResolutionDeadline} /></div>
          </div>
          <div className="pt-2 border-t">
            <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
          </div>
          {isStaff && ticket.status !== "Closed" && (
            <div className="flex gap-2 items-center pt-2 border-t">
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v ?? "")}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Change status..." /></SelectTrigger>
                <SelectContent>
                  {ticket.status === "Open" && <><SelectItem value="Triaged">Triaged</SelectItem><SelectItem value="Closed">Closed</SelectItem></>}
                  {ticket.status === "Triaged" && <><SelectItem value="InProgress">In Progress</SelectItem><SelectItem value="OnHold">On Hold</SelectItem><SelectItem value="Closed">Closed</SelectItem></>}
                  {ticket.status === "InProgress" && <><SelectItem value="OnHold">On Hold</SelectItem><SelectItem value="Resolved">Resolved</SelectItem><SelectItem value="Closed">Closed</SelectItem></>}
                  {ticket.status === "OnHold" && <><SelectItem value="InProgress">In Progress</SelectItem><SelectItem value="Closed">Closed</SelectItem></>}
                  {ticket.status === "Resolved" && <><SelectItem value="Closed">Closed</SelectItem><SelectItem value="InProgress">Reopen</SelectItem></>}
                </SelectContent>
              </Select>
              <Button onClick={handleStatusChange} disabled={!newStatus} size="sm">Update</Button>
              {!ticket.assignedAgentId && (
                <Button variant="outline" size="sm" onClick={() => router.push(`/tickets/${ticketId}/assign`)}>Assign Agent</Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      {isStaff && ticket.status !== "Closed" && (
        <div className="grid gap-4 md:grid-cols-2" data-demo="ticket-tools">
          <ResolutionSuggester ticketId={ticketId} />
          <AutoResponseDrafter ticketId={ticketId} />
        </div>
      )}
      {isStaff && ticket.status === "Resolved" && (
        <KbArticleGenerator ticketId={ticketId} categoryId={ticket.categoryId} />
      )}
      <div>
        <h2 className="text-lg font-semibold mb-4">Replies</h2>
        <TicketTimeline ticketId={ticketId} />
        {ticket.status !== "Closed" && <TicketReplyForm ticketId={ticketId} />}
      </div>
    </div>
  );
}
