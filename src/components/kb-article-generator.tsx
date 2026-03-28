"use client";

import { useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Id } from "../../convex/_generated/dataModel";
import { BookOpen, Loader2, Save } from "lucide-react";

export function KbArticleGenerator({ ticketId, categoryId }: { ticketId: Id<"tickets">; categoryId: Id<"categories"> }) {
  const generateKbArticle = useAction(api.ai.generateKbArticle);
  const createArticle = useMutation(api.knowledgeArticles.create);
  const categories = useQuery(api.categories.list, { activeOnly: true });
  const [article, setArticle] = useState<{ title: string; content: string; excerpt: string } | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categoryId);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await generateKbArticle({ ticketId });
      if (result.error) {
        setError(result.error);
      } else {
        setArticle(result as { title: string; content: string; excerpt: string });
      }
    } catch {
      setError("Failed to generate article");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!article) return;
    await createArticle({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      categoryId: selectedCategoryId as Id<"categories">,
      status: "Draft",
    });
    setSaved(true);
  };

  if (saved) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="py-3 px-4">
          <p className="text-sm text-green-700 flex items-center gap-2"><BookOpen className="h-4 w-4" /> KB article draft saved successfully.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-purple-500" />
            Generate KB Article
          </CardTitle>
          {!article && (
            <Button variant="outline" size="sm" onClick={handleGenerate} disabled={loading}>
              {loading ? <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Generating...</> : "Generate Article"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!article && !loading && !error && <p className="text-xs text-muted-foreground">Generate a knowledge base article from this resolved ticket.</p>}
        {error && <p className="text-xs text-red-500">{error}</p>}
        {article && (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Title</Label>
              <Input value={article.title} onChange={(e) => setArticle({ ...article, title: e.target.value })} className="text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Excerpt</Label>
              <Input value={article.excerpt} onChange={(e) => setArticle({ ...article, excerpt: e.target.value })} className="text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Category</Label>
              <Select value={selectedCategoryId} onValueChange={(v) => setSelectedCategoryId(v ?? "")}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Content (Markdown)</Label>
              <Textarea value={article.content} onChange={(e) => setArticle({ ...article, content: e.target.value })} rows={10} className="text-sm font-mono" />
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={handleGenerate} disabled={loading}>Regenerate</Button>
              <Button size="sm" onClick={handleSave}><Save className="h-3 w-3 mr-1" /> Save as Draft</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
