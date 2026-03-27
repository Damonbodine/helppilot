"use client";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/loading-skeleton";

export default function AuditLogPage() {
  const user = useQuery(api.users.getCurrentUser);
  const logs = useQuery(api.auditLogs.list, user === undefined ? "skip" : {});
  if (logs === undefined) return <LoadingSkeleton type="table" />;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Audit Log</h1>
      <Table><TableHeader><TableRow><TableHead>Time</TableHead><TableHead>User</TableHead><TableHead>Action</TableHead><TableHead>Entity</TableHead><TableHead>ID</TableHead></TableRow></TableHeader>
        <TableBody>{logs.map(l => (<TableRow key={l._id}><TableCell className="text-xs">{new Date(l.createdAt).toLocaleString()}</TableCell><TableCell className="text-xs">{l.userId.slice(0, 8)}</TableCell><TableCell><Badge variant="outline" className="text-xs">{l.action}</Badge></TableCell><TableCell className="text-xs">{l.entityType}</TableCell><TableCell className="text-xs font-mono">{l.entityId.slice(-8)}</TableCell></TableRow>))}</TableBody></Table>
    </div>
  );
}
