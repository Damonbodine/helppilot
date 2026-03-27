import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db.query("agents").withIndex("by_isActive", (q) => q.eq("isActive", true)).collect();
  },
});

export const getById = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db.get(args.agentId);
  },
});

export const getByUserId = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db.query("agents").withIndex("by_userId", (q) => q.eq("userId", identity.subject)).first();
  },
});

export const create = mutation({
  args: { userId: v.string(), department: v.string(), specialties: v.array(v.string()), maxTicketLoad: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.insert("agents", { ...args, currentTicketCount: 0, availabilityStatus: "Available", ticketsResolved: 0, isActive: true, createdAt: Date.now() });
  },
});

export const update = mutation({
  args: { agentId: v.id("agents"), department: v.optional(v.string()), specialties: v.optional(v.array(v.string())), maxTicketLoad: v.optional(v.number()), availabilityStatus: v.optional(v.union(v.literal("Available"), v.literal("Busy"), v.literal("Away"), v.literal("Offline"))), isActive: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const { agentId, ...updates } = args;
    const filtered = Object.fromEntries(Object.entries(updates).filter(([, val]) => val !== undefined));
    await ctx.db.patch(agentId, filtered);
  },
});