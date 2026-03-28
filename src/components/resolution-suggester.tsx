"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Id } from "../../convex/_generated/dataModel";
import { Lightbulb, Loader2 } from "lucide-react";

export function ResolutionSuggester({ ticketId }: { ticketId: Id<"tickets"> }) {
  const suggestResolutions = useAction(api.ai.suggestResolutions);
  const [result, setResult] = useState<{
    suggestions?: { title: string; summary: string; relevanceScore: number; source: string }[];
    message?: string; error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await suggestResolutions({ ticketId });
      setResult(data);
    } catch {
      setResult({ error: "Failed to fetch suggestions" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            Resolution Suggestions
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleGenerate} disabled={loading}>
            {loading ? <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Searching...</> : "Find Solutions"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!result && !loading && <p className="text-xs text-muted-foreground">Click to search past tickets and knowledge base for similar issues.</p>}
        {result?.message && <p className="text-xs text-muted-foreground">{result.message}</p>}
        {result?.error && <p className="text-xs text-red-500">{result.error}</p>}
        {result?.suggestions && result.suggestions.length > 0 && (
          <div className="space-y-3">
            {result.suggestions.map((s, i) => (
              <div key={i} className="rounded-md border p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{s.title}</span>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-[10px]">{s.source}</Badge>
                    <Badge variant="outline" className="text-[10px]">{Math.round(s.relevanceScore * 100)}%</Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap">{s.summary}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
