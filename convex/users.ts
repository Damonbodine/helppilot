import { v } from "convex/values";
import { query } from "./_generated/server";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const userId = identity.subject;
    const agent = await ctx.db.query("agents").withIndex("by_userId", (q) => q.eq("userId", userId)).first();
    return {
      userId,
      name: identity.name ?? "User",
      email: identity.email ?? "",
      imageUrl: identity.pictureUrl,
      role: agent ? (agent.department === "Admin" ? "Admin" : agent.department === "Team Lead" ? "TeamLead" : "Agent") : "Requester",
      agentId: agent?._id ?? null,
    };
  },
});