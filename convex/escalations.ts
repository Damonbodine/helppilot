import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db.query("escalations").order("desc").collect();
  },
});

export const listByTicket = query({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db.query("escalations").withIndex("by_ticketId", (q) => q.eq("ticketId", args.ticketId)).collect();
  },
});

export const create = mutation({
  args: { ticketId: v.id("tickets"), toAgentId: v.optional(v.id("agents")), toRole: v.optional(v.union(v.literal("TeamLead"), v.literal("Admin"))), reason: v.string(), type: v.union(v.literal("Manual"), v.literal("SLABreach"), v.literal("Reassignment")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const callerAgent = await ctx.db.query("agents").withIndex("by_userId", (q) => q.eq("userId", identity.subject)).first();
    const id = await ctx.db.insert("escalations", { ...args, fromAgentId: callerAgent?._id, createdAt: Date.now() });
    const ticket = await ctx.db.get(args.ticketId);
    if (args.toAgentId) {
      const toAgent = await ctx.db.get(args.toAgentId);
      if (toAgent) await ctx.db.insert("notifications", { userId: toAgent.userId, type: "EscalationAlert", title: "Escalation Alert", message: `Ticket "${ticket?.title}" has been escalated to you.`, ticketId: args.ticketId, link: `/tickets/${args.ticketId}`, isRead: false, createdAt: Date.now() });
    }
    await ctx.db.insert("auditLogs", { userId: identity.subject, action: "Escalation", entityType: "Ticket", entityId: args.ticketId, newValue: JSON.stringify({ reason: args.reason, type: args.type }), createdAt: Date.now() });
    return id;
  },
});