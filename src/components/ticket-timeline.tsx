"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Id } from "../../convex/_generated/dataModel";
import { LoadingSkeleton } from "./loading-skeleton";

export function TicketTimeline({ ticketId }: { ticketId: Id<"tickets"> }) {
  const user = useQuery(api.users.getCurrentUser);
  const replies = useQuery(api.ticketReplies.listByTicket, user === undefined ? "skip" : { ticketId });
  const agents = useQuery(api.agents.list, user === undefined ? "skip" : {});

  if (replies === undefined) return <LoadingSkeleton type="detail" />;

  const getAuthorDisplay = (authorId: string) => {
    if (user && authorId === user.userId) return { name: user.name || "You", initials: (user.name || "Y").slice(0, 2).toUpperCase() };
    const agent = agents?.find((a) => a.userId === authorId);
    if (agent) return { name: `${agent.department} Agent`, initials: agent.department.slice(0, 2).toUpperCase() };
    return { name: "Requester", initials: "RQ" };
  };

  return (
    <div className="space-y-4">
      {replies.map((reply) => {
        const author = getAuthorDisplay(reply.authorId);
        return (
        <div key={reply._id} className={cn("rounded-lg p-4", reply.isInternal ? "bg-amber-50 border border-amber-200" : "bg-card border")}>
          <div className="flex items-center gap-3 mb-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">{author.initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <span className="text-sm font-medium">{author.name}</span>
              {reply.isInternal && <Badge variant="outline" className="ml-2 text-[10px] bg-amber-100 text-amber-700 border-amber-300">Internal</Badge>}
            </div>
            <span className="text-xs text-muted-foreground">{new Date(reply.createdAt).toLocaleString()}</span>
            {reply.editedAt && <span className="text-xs text-muted-foreground">(edited)</span>}
          </div>
          <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
        </div>
        );
      })}
    </div>
  );
}