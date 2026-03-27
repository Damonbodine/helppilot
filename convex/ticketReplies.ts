import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const listByTicket = query({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const replies = await ctx.db.query("ticketReplies").withIndex("by_ticketId", (q) => q.eq("ticketId", args.ticketId)).collect();
    const agent = await ctx.db.query("agents").withIndex("by_userId", (q) => q.eq("userId", identity.subject)).first();
    if (!agent) return replies.filter((r) => !r.isInternal);
    return replies;
  },
});

export const create = mutation({
  args: { ticketId: v.id("tickets"), content: v.string(), isInternal: v.boolean() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new Error("Ticket not found");
    const agent = await ctx.db.query("agents").withIndex("by_userId", (q) => q.eq("userId", identity.subject)).first();
    if (args.isInternal && !agent) throw new Error("Only staff can create internal notes");
    if (!agent && ticket.requesterId !== identity.subject) throw new Error("You can only reply on your own tickets");
    const replyId = await ctx.db.insert("ticketReplies", { ...args, authorId: identity.subject, createdAt: Date.now() });
    if (agent && !args.isInternal && !ticket.firstResponseAt) {
      const patch: Record<string, unknown> = { firstResponseAt: Date.now() };
      if (ticket.slaResponseDeadline) patch.slaResponseMet = Date.now() <= ticket.slaResponseDeadline;
      await ctx.db.patch(args.ticketId, patch);
    }
    if (!args.isInternal) {
      const notifyUserId = agent ? ticket.requesterId : (ticket.assignedAgentId ? (await ctx.db.get(ticket.assignedAgentId))?.userId : undefined);
      if (notifyUserId) {
        await ctx.db.insert("notifications", { userId: notifyUserId, type: "NewReply", title: "New Reply", message: `New reply on ticket "${ticket.title}".`, ticketId: args.ticketId, link: `/tickets/${args.ticketId}`, isRead: false, createdAt: Date.now() });
      }
    }
    return replyId;
  },
});

export const update = mutation({
  args: { replyId: v.id("ticketReplies"), content: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const reply = await ctx.db.get(args.replyId);
    if (!reply) throw new Error("Reply not found");
    if (reply.authorId !== identity.subject) throw new Error("Can only edit own replies");
    await ctx.db.patch(args.replyId, { content: args.content, editedAt: Date.now() });
  },
});