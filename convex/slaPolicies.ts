import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db.query("slaPolicies").collect();
  },
});

export const getById = query({
  args: { policyId: v.id("slaPolicies") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db.get(args.policyId);
  },
});

export const getDefaultByPriority = query({
  args: { priority: v.union(v.literal("Critical"), v.literal("High"), v.literal("Medium"), v.literal("Low")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const policies = await ctx.db.query("slaPolicies").withIndex("by_priority", (q) => q.eq("priority", args.priority)).collect();
    return policies.find((p) => p.isDefault && p.isActive) ?? null;
  },
});

export const create = mutation({
  args: { name: v.string(), priority: v.union(v.literal("Critical"), v.literal("High"), v.literal("Medium"), v.literal("Low")), responseTimeHours: v.number(), resolutionTimeHours: v.number(), escalateAfterResponseHours: v.optional(v.number()), escalateAfterResolutionHours: v.optional(v.number()), escalateToRole: v.optional(v.union(v.literal("TeamLead"), v.literal("Admin"))), isDefault: v.boolean(), isActive: v.boolean() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    if (args.isDefault) {
      const existing = await ctx.db.query("slaPolicies").withIndex("by_priority", (q) => q.eq("priority", args.priority)).collect();
      for (const p of existing) { if (p.isDefault) await ctx.db.patch(p._id, { isDefault: false }); }
    }
    return await ctx.db.insert("slaPolicies", { ...args, createdAt: Date.now() });
  },
});

export const update = mutation({
  args: { policyId: v.id("slaPolicies"), name: v.optional(v.string()), priority: v.optional(v.union(v.literal("Critical"), v.literal("High"), v.literal("Medium"), v.literal("Low"))), responseTimeHours: v.optional(v.number()), resolutionTimeHours: v.optional(v.number()), escalateAfterResponseHours: v.optional(v.number()), escalateAfterResolutionHours: v.optional(v.number()), escalateToRole: v.optional(v.union(v.literal("TeamLead"), v.literal("Admin"))), isDefault: v.optional(v.boolean()), isActive: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const policy = await ctx.db.get(args.policyId);
    if (!policy) throw new Error("Policy not found");
    if (args.isDefault) {
      const priority = args.priority ?? policy.priority;
      const existing = await ctx.db.query("slaPolicies").withIndex("by_priority", (q) => q.eq("priority", priority)).collect();
      for (const p of existing) { if (p.isDefault && p._id !== args.policyId) await ctx.db.patch(p._id, { isDefault: false }); }
    }
    const { policyId, ...updates } = args;
    const filtered = Object.fromEntries(Object.entries(updates).filter(([, val]) => val !== undefined));
    await ctx.db.patch(policyId, filtered);
  },
});

export const remove = mutation({
  args: { policyId: v.id("slaPolicies") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await ctx.db.delete(args.policyId);
  },
});