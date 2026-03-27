"use client";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export default function SLAPoliciesPage() {
  const user = useQuery(api.users.getCurrentUser);
  const policies = useQuery(api.slaPolicies.list, user === undefined ? "skip" : {});
  const router = useRouter();
  if (policies === undefined) return <LoadingSkeleton type="table" />;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">SLA Policies</h1><Link href="/admin/sla-policies/new" className="inline-flex items-center gap-2 rounded-lg bg-primary px-2.5 h-8 text-sm font-medium text-primary-foreground hover:bg-primary/80"><Plus className="h-4 w-4 mr-2" />New Policy</Link></div>
      <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Priority</TableHead><TableHead>Response</TableHead><TableHead>Resolution</TableHead><TableHead>Default</TableHead><TableHead>Active</TableHead><TableHead></TableHead></TableRow></TableHeader>
        <TableBody>{policies.map(p => (<TableRow key={p._id}><TableCell className="font-medium">{p.name}</TableCell><TableCell>{p.priority}</TableCell><TableCell>{p.responseTimeHours}h</TableCell><TableCell>{p.resolutionTimeHours}h</TableCell><TableCell>{p.isDefault && <Badge>Default</Badge>}</TableCell><TableCell><Badge variant={p.isActive ? "default" : "secondary"}>{p.isActive ? "Active" : "Inactive"}</Badge></TableCell><TableCell><Button variant="ghost" size="sm" onClick={() => router.push(`/admin/sla-policies/${p._id}/edit`)}>Edit</Button></TableCell></TableRow>))}</TableBody></Table>
    </div>
  );
}
