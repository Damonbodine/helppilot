"use client";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { KnowledgeArticleForm } from "@/components/knowledge-article-form";
import { LoadingSkeleton } from "@/components/loading-skeleton";

export default function EditArticlePage() {
  const params = useParams();
  const user = useQuery(api.users.getCurrentUser);
  const article = useQuery(api.knowledgeArticles.getById, user === undefined ? "skip" : { articleId: params.id as Id<"knowledgeArticles"> });
  if (article === undefined) return <LoadingSkeleton type="detail" />;
  if (!article) return <div>Article not found</div>;
  return (<div className="space-y-6"><h1 className="text-2xl font-bold">Edit Article</h1><KnowledgeArticleForm initialData={article as any} /></div>);
}
