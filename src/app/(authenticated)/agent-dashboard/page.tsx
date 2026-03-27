"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { StatCard } from "@/components/stat-card";
import { TicketsTable } from "@/components/tickets-table";
import { LoadingSkeleton } from "@/components/loading-skeleton";

export default function AgentDashboardPage() {
  const user = useQuery(api.users.getCurrentUser);
  const stats = useQuery(api.tickets.getAgentStats, user === undefined ? "skip" : {});
  if (stats === undefined) return <LoadingSkeleton type="cards" />;
  if (!stats) return <div className="text-center py-12 text-muted-foreground">No agent profile found</div>;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Agent Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Active Tickets" value={stats.activeTickets.length} accentColor="bg-primary" />
        <StatCard label="Resolved Total" value={stats.ticketsResolved} accentColor="bg-emerald-500" />
        <StatCard label="Satisfaction" value={stats.satisfactionAverage || "N/A"} accentColor="bg-amber-500" />
      </div>
      <h2 className="text-lg font-semibold">My Assigned Tickets</h2>
      {stats.agent && <TicketsTable assignedAgentId={stats.agent._id} />}
    </div>
  );
}
