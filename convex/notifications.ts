import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db.query("notifications").withIndex("by_userId", (q) => q.eq("userId", identity.subject)).order("desc").take(100);
  },
});

export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;
    const unread = await ctx.db.query("notifications").withIndex("by_userId_isRead", (q) => q.eq("userId", identity.subject).eq("isRead", false)).collect();
    return unread.length;
  },
});

export const markRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const notif = await ctx.db.get(args.notificationId);
    if (!notif || notif.userId !== identity.subject) throw new Error("Not found");
    await ctx.db.patch(args.notificationId, { isRead: true, readAt: Date.now() });
  },
});

export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const unread = await ctx.db.query("notifications").withIndex("by_userId_isRead", (q) => q.eq("userId", identity.subject).eq("isRead", false)).collect();
    for (const n of unread) await ctx.db.patch(n._id, { isRead: true, readAt: Date.now() });
  },
});