import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: { activeOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    if (args.activeOnly) return await ctx.db.query("categories").withIndex("by_isActive", (q) => q.eq("isActive", true)).collect();
    return await ctx.db.query("categories").collect();
  },
});

export const getById = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db.get(args.categoryId);
  },
});

export const create = mutation({
  args: { name: v.string(), description: v.optional(v.string()), defaultPriority: v.union(v.literal("Critical"), v.literal("High"), v.literal("Medium"), v.literal("Low")), defaultSLAHours: v.number(), parentCategoryId: v.optional(v.id("categories")), icon: v.optional(v.string()), isActive: v.boolean() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const id = await ctx.db.insert("categories", { ...args, createdAt: Date.now() });
    await ctx.db.insert("auditLogs", { userId: identity.subject, action: "Create", entityType: "Category", entityId: id, newValue: JSON.stringify(args), createdAt: Date.now() });
    return id;
  },
});

export const update = mutation({
  args: { categoryId: v.id("categories"), name: v.optional(v.string()), description: v.optional(v.string()), defaultPriority: v.optional(v.union(v.literal("Critical"), v.literal("High"), v.literal("Medium"), v.literal("Low"))), defaultSLAHours: v.optional(v.number()), parentCategoryId: v.optional(v.id("categories")), icon: v.optional(v.string()), isActive: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const { categoryId, ...updates } = args;
    const filtered = Object.fromEntries(Object.entries(updates).filter(([, val]) => val !== undefined));
    await ctx.db.patch(categoryId, filtered);
    await ctx.db.insert("auditLogs", { userId: identity.subject, action: "Update", entityType: "Category", entityId: categoryId, newValue: JSON.stringify(filtered), createdAt: Date.now() });
  },
});

export const remove = mutation({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await ctx.db.delete(args.categoryId);
    await ctx.db.insert("auditLogs", { userId: identity.subject, action: "Delete", entityType: "Category", entityId: args.categoryId, createdAt: Date.now() });
  },
});