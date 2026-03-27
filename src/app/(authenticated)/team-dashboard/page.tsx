"use client";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { StatCard } from "@/components/stat-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/loading-skeleton";

export default function TeamDashboardPage() {
  const user = useQuery(api.users.getCurrentUser);
  const stats = useQuery(api.tickets.getTeamStats, user === undefined ? "skip" : {});
  if (stats === undefined) return <LoadingSkeleton type="cards" />;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Team Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Unassigned Tickets" value={stats.unassignedCount} accentColor="bg-amber-500" />
        <StatCard label="SLA Compliance" value={`${stats.slaCompliance}%`} accentColor="bg-emerald-500" />
        <StatCard label="Open Escalations" value={stats.escalationCount} accentColor="bg-red-500" />
      </div>
      <h2 className="text-lg font-semibold">Agent Workload</h2>
      <Table><TableHeader><TableRow><TableHead>Agent</TableHead><TableHead>Department</TableHead><TableHead>Tickets</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
        <TableBody>{stats.agents.map((a: any) => (<TableRow key={a._id}><TableCell className="text-sm font-medium">{a.department} Agent</TableCell><TableCell>{a.department}</TableCell><TableCell>{a.currentTicketCount}/{a.maxTicketLoad}</TableCell><TableCell><Badge variant="outline">{a.availabilityStatus}</Badge></TableCell></TableRow>))}</TableBody></Table>
    </div>
  );
}
