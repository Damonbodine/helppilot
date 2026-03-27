import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db.query("tags").collect();
  },
});

export const create = mutation({
  args: { name: v.string(), color: v.string(), description: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.insert("tags", { ...args, usageCount: 0, createdAt: Date.now() });
  },
});

export const update = mutation({
  args: { tagId: v.id("tags"), name: v.optional(v.string()), color: v.optional(v.string()), description: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const { tagId, ...updates } = args;
    const filtered = Object.fromEntries(Object.entries(updates).filter(([, val]) => val !== undefined));
    await ctx.db.patch(tagId, filtered);
  },
});

export const remove = mutation({
  args: { tagId: v.id("tags") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await ctx.db.delete(args.tagId);
  },
});