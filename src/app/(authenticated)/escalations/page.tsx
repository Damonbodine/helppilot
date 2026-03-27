"use client";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { EmptyState } from "@/components/empty-state";
import { AlertTriangle } from "lucide-react";

export default function EscalationsPage() {
  const user = useQuery(api.users.getCurrentUser);
  const escalations = useQuery(api.escalations.list, user === undefined ? "skip" : {});
  const tickets = useQuery(api.tickets.list, user === undefined ? "skip" : {});
  if (escalations === undefined) return <LoadingSkeleton type="table" />;
  if (escalations.length === 0) return <EmptyState icon={AlertTriangle} title="No escalations" description="No tickets have been escalated." />;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Escalations</h1>
      <Table><TableHeader><TableRow><TableHead>Ticket</TableHead><TableHead>Type</TableHead><TableHead>Reason</TableHead><TableHead>Created</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
        <TableBody>{escalations.map(e => { const ticket = tickets?.find(t => t._id === e.ticketId); return (
          <TableRow key={e._id}><TableCell className="font-medium">{ticket?.title ?? "—"}</TableCell><TableCell><Badge variant="outline">{e.type}</Badge></TableCell><TableCell className="text-sm max-w-xs truncate">{e.reason}</TableCell><TableCell className="text-xs">{new Date(e.createdAt).toLocaleString()}</TableCell><TableCell>{e.resolvedAt ? <Badge variant="secondary">Resolved</Badge> : <Badge variant="destructive">Open</Badge>}</TableCell></TableRow>
        ); })}</TableBody></Table>
    </div>
  );
}
