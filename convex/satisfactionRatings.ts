import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getByTicket = query({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db.query("satisfactionRatings").withIndex("by_ticketId", (q) => q.eq("ticketId", args.ticketId)).first();
  },
});

export const listByAgent = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db.query("satisfactionRatings").withIndex("by_agentId", (q) => q.eq("agentId", args.agentId)).collect();
  },
});

export const getReport = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { overallAverage: 0, totalRatings: 0, agentBreakdown: [] };
    const allRatings = await ctx.db.query("satisfactionRatings").collect();
    const overallAverage = allRatings.length > 0 ? Math.round(allRatings.reduce((s, r) => s + r.rating, 0) / allRatings.length * 10) / 10 : 0;
    const byAgent = new Map<string, { total: number; count: number; agentId: string }>();
    for (const r of allRatings) {
      const key = r.agentId;
      const existing = byAgent.get(key) || { total: 0, count: 0, agentId: key };
      existing.total += r.rating;
      existing.count++;
      byAgent.set(key, existing);
    }
    const agentBreakdown = Array.from(byAgent.values()).map((a) => ({ agentId: a.agentId, averageRating: Math.round(a.total / a.count * 10) / 10, totalRatings: a.count }));
    return { overallAverage, totalRatings: allRatings.length, agentBreakdown };
  },
});

export const upsert = mutation({
  args: { ticketId: v.id("tickets"), rating: v.number(), comment: v.optional(v.string()), isPublic: v.boolean() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new Error("Ticket not found");
    if (ticket.status !== "Resolved") throw new Error("Ratings can only be submitted when ticket is Resolved");
    if (!ticket.assignedAgentId) throw new Error("Cannot rate a ticket with no assigned agent");
    const existing = await ctx.db.query("satisfactionRatings").withIndex("by_ticketId", (q) => q.eq("ticketId", args.ticketId)).first();
    if (existing) {
      await ctx.db.patch(existing._id, { rating: args.rating, comment: args.comment, isPublic: args.isPublic, updatedAt: Date.now() });
      // Update agent average
      const agentRatings = await ctx.db.query("satisfactionRatings").withIndex("by_agentId", (q) => q.eq("agentId", ticket.assignedAgentId!)).collect();
      const avg = agentRatings.reduce((s, r) => s + (r._id === existing._id ? args.rating : r.rating), 0) / agentRatings.length;
      await ctx.db.patch(ticket.assignedAgentId, { satisfactionAverage: Math.round(avg * 10) / 10 });
      return existing._id;
    }
    const id = await ctx.db.insert("satisfactionRatings", { ticketId: args.ticketId, requesterId: identity.subject, agentId: ticket.assignedAgentId, rating: args.rating, comment: args.comment, isPublic: args.isPublic, createdAt: Date.now() });
    const agentRatings = await ctx.db.query("satisfactionRatings").withIndex("by_agentId", (q) => q.eq("agentId", ticket.assignedAgentId!)).collect();
    const avg = agentRatings.reduce((s, r) => s + r.rating, 0) / agentRatings.length;
    await ctx.db.patch(ticket.assignedAgentId, { satisfactionAverage: Math.round(avg * 10) / 10 });
    return id;
  },
});