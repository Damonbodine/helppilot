"use client";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TicketsTable } from "@/components/tickets-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import Link from "next/link";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const user = useQuery(api.users.getCurrentUser);
  const articles = useQuery(api.knowledgeArticles.list, user === undefined ? "skip" : { search: query || undefined });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Search</h1>
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search tickets and articles..." value={query} onChange={e => setQuery(e.target.value)} className="pl-10" /></div>
      <Tabs defaultValue="tickets">
        <TabsList><TabsTrigger value="tickets">Tickets</TabsTrigger><TabsTrigger value="articles">Articles</TabsTrigger></TabsList>
        <TabsContent value="tickets"><TicketsTable /></TabsContent>
        <TabsContent value="articles">
          <div className="grid gap-3">{articles?.map(a => (
            <Link key={a._id} href={`/knowledge/${a._id}`}><Card className="hover:shadow-sm"><CardHeader className="pb-1"><CardTitle className="text-sm">{a.title}</CardTitle></CardHeader><CardContent><p className="text-xs text-muted-foreground">{a.excerpt}</p></CardContent></Card></Link>
          ))}</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
