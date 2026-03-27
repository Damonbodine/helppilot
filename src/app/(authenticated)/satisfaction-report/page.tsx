"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatCard } from "@/components/stat-card";
import { LoadingSkeleton } from "@/components/loading-skeleton";

export default function SatisfactionReportPage() {
  const user = useQuery(api.users.getCurrentUser);
  const report = useQuery(api.satisfactionRatings.getReport, user === undefined ? "skip" : {});
  if (report === undefined) return <LoadingSkeleton type="cards" />;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Satisfaction Report</h1>
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Overall Average" value={report.overallAverage || "N/A"} accentColor="bg-amber-500" />
        <StatCard label="Total Ratings" value={report.totalRatings} accentColor="bg-primary" />
      </div>
      <Card><CardHeader><CardTitle>Per-Agent Breakdown</CardTitle></CardHeader>
        <CardContent><Table><TableHeader><TableRow><TableHead>Agent</TableHead><TableHead>Avg Rating</TableHead><TableHead>Total</TableHead></TableRow></TableHeader>
          <TableBody>{report.agentBreakdown.map((a: any) => (<TableRow key={a.agentId}><TableCell className="font-mono text-sm">{a.agentId.slice(-8)}</TableCell><TableCell>{"⭐".repeat(Math.round(a.averageRating))} {a.averageRating}</TableCell><TableCell>{a.totalRatings}</TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
    </div>
  );
}
