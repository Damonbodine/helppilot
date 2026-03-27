"use client";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { PriorityBadge } from "@/components/priority-badge";
import { LoadingSkeleton } from "@/components/loading-skeleton";

export default function SLADashboardPage() {
  const user = useQuery(api.users.getCurrentUser);
  const tickets = useQuery(api.tickets.list, user === undefined ? "skip" : {});
  if (tickets === undefined) return <LoadingSkeleton type="cards" />;
  const now = Date.now();
  const active = tickets.filter(t => !["Resolved", "Closed"].includes(t.status));
  const onTrack = active.filter(t => t.slaResolutionDeadline && (t.slaResolutionDeadline - now) > (t.slaResolutionDeadline - t.createdAt) * 0.25);
  const atRisk = active.filter(t => t.slaResolutionDeadline && (t.slaResolutionDeadline - now) > 0 && (t.slaResolutionDeadline - now) <= (t.slaResolutionDeadline - t.createdAt) * 0.25);
  const breached = active.filter(t => t.slaResolutionDeadline && now > t.slaResolutionDeadline);
  const groups = [{ label: "On Track", tickets: onTrack, color: "bg-emerald-500" }, { label: "At Risk", tickets: atRisk, color: "bg-amber-500" }, { label: "Breached", tickets: breached, color: "bg-red-500" }];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">SLA Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">{groups.map(g => (
        <Card key={g.label}><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${g.color}`} />{g.label} ({g.tickets.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">{g.tickets.slice(0, 5).map(t => (<div key={t._id} className="flex items-center justify-between text-sm"><span className="truncate max-w-[200px]">{t.title}</span><div className="flex gap-1"><StatusBadge status={t.status} /><PriorityBadge priority={t.priority} /></div></div>))}</CardContent></Card>
      ))}</div>
    </div>
  );
}
