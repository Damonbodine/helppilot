"use client";


import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { PriorityBadge } from "@/components/priority-badge";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { EmptyState } from "@/components/empty-state";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Ticket } from "lucide-react";

export default function MyTicketsPage() {
  const user = useQuery(api.users.getCurrentUser);
  const tickets = useQuery(api.tickets.getMyTickets, user === undefined ? "skip" : {});
  const router = useRouter();

  if (tickets === undefined) return <LoadingSkeleton type="table" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Tickets</h1>
        <Link href="/tickets/new" className="inline-flex items-center gap-2 rounded-lg bg-primary px-2.5 h-8 text-sm font-medium text-primary-foreground hover:bg-primary/80"><Plus className="h-4 w-4 mr-2" />New Ticket</Link>
      </div>
      {tickets.length === 0 ? (
        <EmptyState icon={Ticket} title="No tickets yet" description="Submit a ticket to get help from the IT team." actionLabel="Submit Ticket" actionHref="/tickets/new" />
      ) : (
        <Table>
          <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Status</TableHead><TableHead>Priority</TableHead><TableHead>Created</TableHead></TableRow></TableHeader>
          <TableBody>
            {tickets.map((t) => (
              <TableRow key={t._id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/my-tickets/${t._id}`)}>
                <TableCell className="font-medium">{t.title}</TableCell>
                <TableCell><StatusBadge status={t.status} /></TableCell>
                <TableCell><PriorityBadge priority={t.priority} /></TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
