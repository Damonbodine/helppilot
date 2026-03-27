"use client";


import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/loading-skeleton";

export default function AssignPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as Id<"tickets">;
  const user = useQuery(api.users.getCurrentUser);
  const agents = useQuery(api.agents.list, user === undefined ? "skip" : {});
  const assignTicket = useMutation(api.tickets.assign);

  if (agents === undefined) return <LoadingSkeleton type="table" />;

  const handleAssign = async (agentId: Id<"agents">) => {
    await assignTicket({ ticketId, agentId });
    router.push(`/tickets/${ticketId}`);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Assign Agent</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Agent</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Tickets</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Specialties</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map((agent) => (
            <TableRow key={agent._id} className={agent.currentTicketCount >= agent.maxTicketLoad ? "opacity-60" : ""}>
              <TableCell className="font-medium">{agent.userId.slice(0, 8)}</TableCell>
              <TableCell>{agent.department}</TableCell>
              <TableCell>{agent.currentTicketCount}/{agent.maxTicketLoad}{agent.currentTicketCount >= agent.maxTicketLoad && <Badge variant="destructive" className="ml-2 text-[10px]">Full</Badge>}</TableCell>
              <TableCell><Badge variant="outline">{agent.availabilityStatus}</Badge></TableCell>
              <TableCell className="text-xs text-muted-foreground">{agent.specialties.join(", ")}</TableCell>
              <TableCell><Button size="sm" onClick={() => handleAssign(agent._id)}>Assign</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
