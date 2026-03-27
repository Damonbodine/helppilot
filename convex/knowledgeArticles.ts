import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: { categoryId: v.optional(v.id("categories")), status: v.optional(v.union(v.literal("Draft"), v.literal("Published"), v.literal("Archived"))), search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    let articles;
    if (args.categoryId) { articles = await ctx.db.query("knowledgeArticles").withIndex("by_categoryId", (q) => q.eq("categoryId", args.categoryId!)).collect(); }
    else if (args.status) { articles = await ctx.db.query("knowledgeArticles").withIndex("by_status", (q) => q.eq("status", args.status!)).collect(); }
    else { articles = await ctx.db.query("knowledgeArticles").collect(); }
    const agent = await ctx.db.query("agents").withIndex("by_userId", (q) => q.eq("userId", identity.subject)).first();
    if (!agent) articles = articles.filter((a) => a.status === "Published");
    if (args.search) {
      const s = args.search.toLowerCase();
      articles = articles.filter((a) => a.title.toLowerCase().includes(s) || a.content.toLowerCase().includes(s) || a.excerpt.toLowerCase().includes(s));
    }
    return articles;
  },
});

export const getById = query({
  args: { articleId: v.id("knowledgeArticles") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db.get(args.articleId);
  },
});

export const incrementViewCount = mutation({
  args: { articleId: v.id("knowledgeArticles") },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.articleId);
    if (article) await ctx.db.patch(args.articleId, { viewCount: article.viewCount + 1 });
  },
});

export const create = mutation({
  args: { title: v.string(), content: v.string(), excerpt: v.string(), categoryId: v.id("categories"), status: v.union(v.literal("Draft"), v.literal("Published"), v.literal("Archived")), tags: v.optional(v.array(v.id("tags"))) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const now = Date.now();
    return await ctx.db.insert("knowledgeArticles", { ...args, authorId: identity.subject, viewCount: 0, helpfulCount: 0, notHelpfulCount: 0, publishedAt: args.status === "Published" ? now : undefined, createdAt: now });
  },
});

export const update = mutation({
  args: { articleId: v.id("knowledgeArticles"), title: v.optional(v.string()), content: v.optional(v.string()), excerpt: v.optional(v.string()), categoryId: v.optional(v.id("categories")), status: v.optional(v.union(v.literal("Draft"), v.literal("Published"), v.literal("Archived"))), tags: v.optional(v.array(v.id("tags"))) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const { articleId, ...updates } = args;
    const filtered: Record<string, unknown> = Object.fromEntries(Object.entries(updates).filter(([, val]) => val !== undefined));
    if (args.status === "Published") { const article = await ctx.db.get(articleId); if (article && !article.publishedAt) filtered.publishedAt = Date.now(); }
    if (args.content) filtered.lastRevisedAt = Date.now();
    await ctx.db.patch(articleId, filtered);
  },
});

export const remove = mutation({
  args: { articleId: v.id("knowledgeArticles") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await ctx.db.delete(args.articleId);
  },
});

export const vote = mutation({
  args: { articleId: v.id("knowledgeArticles"), helpful: v.boolean() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const article = await ctx.db.get(args.articleId);
    if (!article) throw new Error("Article not found");
    await ctx.db.patch(args.articleId, args.helpful ? { helpfulCount: article.helpfulCount + 1 } : { notHelpfulCount: article.notHelpfulCount + 1 });
  },
});