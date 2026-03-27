"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "./status-badge";
import { PriorityBadge } from "./priority-badge";
import { SlaCountdown } from "./sla-countdown";
import { LoadingSkeleton } from "./loading-skeleton";
import { EmptyState } from "./empty-state";
import { useRouter } from "next/navigation";
import { Ticket } from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";

type TicketsTableProps = {
  status?: "Open" | "Triaged" | "InProgress" | "OnHold" | "Resolved" | "Closed";
  assignedAgentId?: Id<"agents">;
  unassignedOnly?: boolean;
};

export function TicketsTable({ status, assignedAgentId, unassignedOnly }: TicketsTableProps) {
  const user = useQuery(api.users.getCurrentUser);
  const tickets = useQuery(api.tickets.list, user === undefined ? "skip" : { status, assignedAgentId, unassignedOnly });
  const categories = useQuery(api.categories.list, user === undefined ? "skip" : {});
  const agents = useQuery(api.agents.list, user === undefined ? "skip" : {});
  const router = useRouter();

  if (tickets === undefined) return <LoadingSkeleton type="table" />;
  if (tickets.length === 0) return <EmptyState icon={Ticket} title="No tickets found" description="No tickets match the current filters." />;

  const getCategoryName = (id: string) => categories?.find((c) => c._id === id)?.name ?? "—";
  const getAgentName = (id: string | undefined) => {
    if (!id) return "Unassigned";
    const agent = agents?.find((a) => a._id === id);
    return agent?.userId?.slice(0, 8) ?? "—";
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticket</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Agent</TableHead>
            <TableHead>SLA</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket._id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/tickets/${ticket._id}`)}>
              <TableCell>
                <div className="font-medium text-sm">{ticket.title}</div>
                <div className="text-xs text-muted-foreground">#{ticket._id.slice(-6)}</div>
              </TableCell>
              <TableCell><StatusBadge status={ticket.status} /></TableCell>
              <TableCell><PriorityBadge priority={ticket.priority} /></TableCell>
              <TableCell className="text-sm text-muted-foreground">{getCategoryName(ticket.categoryId)}</TableCell>
              <TableCell className="text-sm">{getAgentName(ticket.assignedAgentId)}</TableCell>
              <TableCell><SlaCountdown deadline={ticket.slaResolutionDeadline} /></TableCell>
              <TableCell className="text-xs text-muted-foreground">{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}