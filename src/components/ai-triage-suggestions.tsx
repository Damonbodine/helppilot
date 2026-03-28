"use client";

import { useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Id } from "../../convex/_generated/dataModel";
import { Sparkles, Check, X, Loader2 } from "lucide-react";

export function AiTriageSuggestions({ ticketId, title, description }: { ticketId: Id<"tickets">; title: string; description: string }) {
  const triageTicket = useAction(api.ai.triageTicket);
  const updateTicket = useMutation(api.tickets.update);
  const assignTicket = useMutation(api.tickets.assign);
  const [suggestions, setSuggestions] = useState<{
    categoryId?: string; categoryName?: string; priority?: string; priorityReason?: string;
    tagIds?: string[]; tagNames?: string[]; agentId?: string | null; agentReason?: string; summary?: string; error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await triageTicket({ title, description });
      setSuggestions(result);
    } catch {
      setSuggestions({ error: "Failed to generate suggestions" });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!suggestions || suggestions.error) return;
    try {
      const patch: Record<string, unknown> = {};
      if (suggestions.categoryId) patch.categoryId = suggestions.categoryId as Id<"categories">;
      if (suggestions.priority) patch.priority = suggestions.priority;
      if (suggestions.tagIds?.length) patch.tags = suggestions.tagIds as Id<"tags">[];
      if (Object.keys(patch).length > 0) {
        await updateTicket({ ticketId, ...patch } as any);
      }
      if (suggestions.agentId) {
        await assignTicket({ ticketId, agentId: suggestions.agentId as Id<"agents"> });
      }
      setAccepted(true);
    } catch {
      // silent — user can manually adjust
    }
  };

  if (dismissed || accepted) return null;

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardContent className="py-3 px-4">
        {!suggestions && !loading && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span>AI can suggest triage for this ticket</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleGenerate}>
              <Sparkles className="h-3 w-3 mr-1" /> Generate Suggestions
            </Button>
          </div>
        )}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Analyzing ticket...</span>
          </div>
        )}
        {suggestions && !suggestions.error && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="h-4 w-4 text-blue-500" />
                AI Triage Suggestions
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={handleAccept}><Check className="h-3 w-3 mr-1" /> Accept</Button>
                <Button variant="ghost" size="sm" onClick={() => setDismissed(true)}><X className="h-3 w-3 mr-1" /> Dismiss</Button>
              </div>
            </div>
            {suggestions.summary && <p className="text-xs text-muted-foreground">{suggestions.summary}</p>}
            <div className="flex flex-wrap gap-2 text-xs">
              {suggestions.categoryName && <Badge variant="outline">Category: {suggestions.categoryName}</Badge>}
              {suggestions.priority && <Badge variant="outline">Priority: {suggestions.priority}</Badge>}
              {suggestions.tagNames?.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
              {suggestions.agentReason && <Badge variant="outline">Agent: {suggestions.agentReason}</Badge>}
            </div>
            {suggestions.priorityReason && <p className="text-xs text-muted-foreground">{suggestions.priorityReason}</p>}
          </div>
        )}
        {suggestions?.error && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-red-500">{suggestions.error}</span>
            <Button variant="ghost" size="sm" onClick={() => { setSuggestions(null); setDismissed(true); }}><X className="h-3 w-3" /></Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
