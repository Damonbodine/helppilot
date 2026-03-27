"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useEffect } from "react";
import Link from "next/link";

export default function ArticleDetailPage() {
  const params = useParams();
  const articleId = params.id as Id<"knowledgeArticles">;
  const user = useQuery(api.users.getCurrentUser);
  const article = useQuery(api.knowledgeArticles.getById, user === undefined ? "skip" : { articleId });
  const categories = useQuery(api.categories.list, user === undefined ? "skip" : {});
  const incrementView = useMutation(api.knowledgeArticles.incrementViewCount);
  const vote = useMutation(api.knowledgeArticles.vote);

  useEffect(() => { if (article) incrementView({ articleId }); }, [article?._id]);

  if (article === undefined) return <LoadingSkeleton type="detail" />;
  if (!article) return <div className="text-center py-12">Article not found</div>;

  const category = categories?.find(c => c._id === article.categoryId);
  const isStaff = user?.role !== "Requester";

  return (
    <div className="max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{article.title}</CardTitle>
              <div className="flex gap-2 mt-2"><Badge variant="outline">{category?.name}</Badge><Badge variant="outline">{article.status}</Badge></div>
            </div>
            {isStaff && <Link href={`/knowledge/${articleId}/edit`} className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2 h-7 text-sm font-medium hover:bg-muted">Edit</Link>}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none whitespace-pre-wrap">{article.content}</div>
          <div className="flex items-center gap-4 pt-4 border-t">
            <span className="text-sm text-muted-foreground">Was this helpful?</span>
            <Button variant="outline" size="sm" onClick={() => vote({ articleId, helpful: true })}><ThumbsUp className="h-4 w-4 mr-1" />{article.helpfulCount}</Button>
            <Button variant="outline" size="sm" onClick={() => vote({ articleId, helpful: false })}><ThumbsDown className="h-4 w-4 mr-1" />{article.notHelpfulCount}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
