import { v } from "convex/values";
import { query } from "./_generated/server";

export const list = query({
  args: { userId: v.optional(v.string()), action: v.optional(v.union(v.literal("Create"), v.literal("Update"), v.literal("Delete"), v.literal("StatusChange"), v.literal("Assignment"), v.literal("Escalation"), v.literal("Login"), v.literal("SLABreach"))), entityType: v.optional(v.string()), limit: v.optional(v.number()), cursor: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    let logs;
    if (args.userId) logs = await ctx.db.query("auditLogs").withIndex("by_userId", (q) => q.eq("userId", args.userId!)).order("desc").collect();
    else if (args.action) logs = await ctx.db.query("auditLogs").withIndex("by_action", (q) => q.eq("action", args.action!)).order("desc").collect();
    else if (args.entityType) logs = await ctx.db.query("auditLogs").withIndex("by_entityType", (q) => q.eq("entityType", args.entityType!)).order("desc").collect();
    else logs = await ctx.db.query("auditLogs").order("desc").collect();
    const limit = args.limit ?? 50;
    return logs.slice(0, limit);
  },
});