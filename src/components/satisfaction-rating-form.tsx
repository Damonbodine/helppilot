"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { Id } from "../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";

export function SatisfactionRatingForm({ ticketId }: { ticketId: Id<"tickets"> }) {
  const router = useRouter();
  const existingRating = useQuery(api.satisfactionRatings.getByTicket, { ticketId });
  const upsertRating = useMutation(api.satisfactionRatings.upsert);

  const [rating, setRating] = useState(existingRating?.rating ?? 0);
  const [comment, setComment] = useState(existingRating?.comment ?? "");
  const [isPublic, setIsPublic] = useState(existingRating?.isPublic ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    setIsSubmitting(true);
    try {
      await upsertRating({ ticketId, rating, comment: comment || undefined, isPublic });
      router.back();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      <div className="space-y-2">
        <Label>Rating</Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} type="button" onClick={() => setRating(star)} className={cn("text-3xl transition-colors", star <= rating ? "text-yellow-400" : "text-gray-300")}>
              ★
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="comment">Comment (optional)</Label>
        <Textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your feedback..." />
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={isPublic} onCheckedChange={setIsPublic} />
        <Label>Make comment visible to agent</Label>
      </div>
      <Button type="submit" disabled={isSubmitting || rating === 0}>
        {isSubmitting ? "Submitting..." : existingRating ? "Update Rating" : "Submit Rating"}
      </Button>
    </form>
  );
}