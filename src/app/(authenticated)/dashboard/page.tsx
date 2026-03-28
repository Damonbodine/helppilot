"use client";


import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { DemoModeStartButton } from "@/components/demo-mode";
import { StatCard } from "@/components/stat-card";
import { LoadingSkeleton } from "@/components/loading-skeleton";

export default function DashboardPage() {
  const user = useQuery(api.users.getCurrentUser);
  const stats = useQuery(api.tickets.getDashboardStats, user === undefined ? "skip" : {});

  if (stats === undefined) return <LoadingSkeleton type="cards" />;

  return (
    <div className="space-y-6" data-demo="dashboard-overview">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Organization-wide IT support metrics</p>
        </div>
        <DemoModeStartButton />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4" data-demo="dashboard-stats">
        <StatCard label="Open Tickets" value={stats.openCount} accentColor="bg-primary" />
        <StatCard label="SLA Compliance" value={`${stats.slaCompliancePercent}%`} accentColor="bg-emerald-500" />
        <StatCard label="Avg Resolution" value={`${stats.avgResolutionHours}h`} accentColor="bg-blue-500" />
        <StatCard label="Avg Satisfaction" value={stats.avgSatisfaction || "N/A"} accentColor="bg-amber-500" />
      </div>
    </div>
  );
}
