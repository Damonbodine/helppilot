"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Id } from "../../convex/_generated/dataModel";

type ArticleFormProps = {
  initialData?: {
    _id: Id<"knowledgeArticles">;
    title: string;
    content: string;
    excerpt: string;
    categoryId: Id<"categories">;
    status: string;
  };
};

export function KnowledgeArticleForm({ initialData }: ArticleFormProps) {
  const router = useRouter();
  const categories = useQuery(api.categories.list, { activeOnly: true });
  const createArticle = useMutation(api.knowledgeArticles.create);
  const updateArticle = useMutation(api.knowledgeArticles.update);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? "");
  const [status, setStatus] = useState(initialData?.status ?? "Draft");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (initialData) {
        await updateArticle({
          articleId: initialData._id,
          title,
          content,
          excerpt,
          categoryId: categoryId as Id<"categories">,
          status: status as "Draft" | "Published" | "Archived",
        });
      } else {
        await createArticle({
          title,
          content,
          excerpt,
          categoryId: categoryId as Id<"categories">,
          status: status as "Draft" | "Published" | "Archived",
        });
      }
      router.push("/knowledge");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Short summary for search results" rows={2} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Content (Markdown)</Label>
        <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Article body in markdown format" rows={15} required className="font-mono text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "")}>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {categories?.map((cat) => (
                <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v ?? "")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Published">Published</SelectItem>
              <SelectItem value="Archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : initialData ? "Update Article" : "Create Article"}
      </Button>
    </form>
  );
}