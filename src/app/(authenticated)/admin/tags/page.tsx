"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

export default function TagsPage() {
  const user = useQuery(api.users.getCurrentUser);
  const tags = useQuery(api.tags.list, user === undefined ? "skip" : {});
  const removeTag = useMutation(api.tags.remove);
  const router = useRouter();
  if (tags === undefined) return <LoadingSkeleton type="cards" />;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Tags</h1><Link href="/admin/tags/new" className="inline-flex items-center gap-2 rounded-lg bg-primary px-2.5 h-8 text-sm font-medium text-primary-foreground hover:bg-primary/80"><Plus className="h-4 w-4 mr-2" />New Tag</Link></div>
      <div className="flex flex-wrap gap-3">{tags.map(t => (
        <div key={t._id} className="flex items-center gap-2 border rounded-lg px-3 py-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
          <span className="font-medium text-sm">{t.name}</span>
          <Badge variant="secondary" className="text-[10px]">{t.usageCount}</Badge>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => router.push(`/admin/tags/${t._id}/edit`)}><span className="text-xs">✏️</span></Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeTag({ tagId: t._id })}><Trash2 className="h-3 w-3" /></Button>
        </div>
      ))}</div>
    </div>
  );
}
