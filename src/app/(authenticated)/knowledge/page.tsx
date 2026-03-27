"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { EmptyState } from "@/components/empty-state";
import Link from "next/link";
import { BookOpen, Plus, Search } from "lucide-react";

export default function KnowledgeBasePage() {
  const [search, setSearch] = useState("");
  const user = useQuery(api.users.getCurrentUser);
  const articles = useQuery(api.knowledgeArticles.list, user === undefined ? "skip" : { search: search || undefined });
  const categories = useQuery(api.categories.list, user === undefined ? "skip" : {});
  const isStaff = user?.role !== "Requester";

  if (articles === undefined) return <LoadingSkeleton type="cards" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Knowledge Base</h1>
        {isStaff && <Link href="/knowledge/new" className="inline-flex items-center gap-2 rounded-lg bg-primary px-2.5 h-8 text-sm font-medium text-primary-foreground hover:bg-primary/80"><Plus className="h-4 w-4 mr-2" />New Article</Link>}
      </div>
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search articles..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" /></div>
      {articles.length === 0 ? (
        <EmptyState icon={BookOpen} title="No articles found" description="No knowledge base articles match your search." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <Link key={a._id} href={`/knowledge/${a._id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{a.title}</CardTitle>
                  <Badge variant="outline" className="w-fit text-xs">{categories?.find(c => c._id === a.categoryId)?.name ?? "—"}</Badge>
                </CardHeader>
                <CardContent><p className="text-sm text-muted-foreground line-clamp-2">{a.excerpt}</p><p className="text-xs text-muted-foreground mt-2">{a.viewCount} views</p></CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
