"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Id } from "../../convex/_generated/dataModel";

export function TicketReplyForm({ ticketId }: { ticketId: Id<"tickets"> }) {
  const user = useQuery(api.users.getCurrentUser);
  const createReply = useMutation(api.ticketReplies.create);
  const [content, setContent] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isStaff = user?.role !== "Requester";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setIsSubmitting(true);
    try {
      await createReply({ ticketId, content, isInternal: isStaff ? isInternal : false });
      setContent("");
      setIsInternal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-4">
      <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write a reply..." rows={3} />
      <div className="flex items-center justify-between">
        {isStaff && (
          <div className="flex items-center gap-2">
            <Switch checked={isInternal} onCheckedChange={setIsInternal} />
            <Label className="text-sm text-muted-foreground">Internal note</Label>
          </div>
        )}
        <Button type="submit" disabled={isSubmitting || !content.trim()} className="ml-auto">
          {isSubmitting ? "Sending..." : isInternal ? "Add Note" : "Reply"}
        </Button>
      </div>
    </form>
  );
}