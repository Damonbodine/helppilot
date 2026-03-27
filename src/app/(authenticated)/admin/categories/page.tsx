"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export default function CategoriesPage() {
  const user = useQuery(api.users.getCurrentUser);
  const categories = useQuery(api.categories.list, user === undefined ? "skip" : {});
  const router = useRouter();
  if (categories === undefined) return <LoadingSkeleton type="table" />;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Categories</h1><Link href="/admin/categories/new" className="inline-flex items-center gap-2 rounded-lg bg-primary px-2.5 h-8 text-sm font-medium text-primary-foreground hover:bg-primary/80"><Plus className="h-4 w-4 mr-2" />New Category</Link></div>
      <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Priority</TableHead><TableHead>SLA Hours</TableHead><TableHead>Active</TableHead><TableHead></TableHead></TableRow></TableHeader>
        <TableBody>{categories.map(c => (<TableRow key={c._id}><TableCell className="font-medium">{c.name}</TableCell><TableCell>{c.defaultPriority}</TableCell><TableCell>{c.defaultSLAHours}h</TableCell><TableCell><Badge variant={c.isActive ? "default" : "secondary"}>{c.isActive ? "Active" : "Inactive"}</Badge></TableCell><TableCell><Button variant="ghost" size="sm" onClick={() => router.push(`/admin/categories/${c._id}/edit`)}>Edit</Button></TableCell></TableRow>))}</TableBody></Table>
    </div>
  );
}
