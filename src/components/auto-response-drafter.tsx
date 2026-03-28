"use client";

import { useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Id } from "../../convex/_generated/dataModel";
import { MessageSquare, Loader2, Send, Copy } from "lucide-react";

export function AutoResponseDrafter({ ticketId }: { ticketId: Id<"tickets"> }) {
  const draftResponse = useAction(api.ai.draftResponse);
  const createReply = useMutation(api.ticketReplies.create);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await draftResponse({ ticketId });
      setDraft(result.draft);
    } catch {
      setDraft("Failed to generate draft response.");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!draft.trim()) return;
    await createReply({ ticketId, content: draft, isInternal: false });
    setSent(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
  };

  if (sent) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-green-500" />
            Auto-Response Drafter
          </CardTitle>
          {!draft && (
            <Button variant="outline" size="sm" onClick={handleGenerate} disabled={loading}>
              {loading ? <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Drafting...</> : "Draft Response"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!draft && !loading && <p className="text-xs text-muted-foreground">AI will draft an initial response based on the ticket details.</p>}
        {draft && (
          <div className="space-y-2">
            <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={6} className="text-sm" />
            <div className="flex items-center gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={handleCopy}><Copy className="h-3 w-3 mr-1" /> Copy</Button>
              <Button variant="ghost" size="sm" onClick={handleGenerate} disabled={loading}>Regenerate</Button>
              <Button size="sm" onClick={handleSend}><Send className="h-3 w-3 mr-1" /> Send as Reply</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
