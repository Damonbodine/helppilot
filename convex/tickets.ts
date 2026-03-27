import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

const VALID_TRANSITIONS: Record<string, string[]> = {
  Open: ["Triaged", "Closed"],
  Triaged: ["InProgress", "OnHold", "Closed"],
  InProgress: ["OnHold", "Resolved", "Closed"],
  OnHold: ["InProgress", "Closed"],
  Resolved: ["Closed", "InProgress"],
};

export const list = query({
  args: {
    status: v.optional(v.union(v.literal("Open"), v.literal("Triaged"), v.literal("InProgress"), v.literal("OnHold"), v.literal("Resolved"), v.literal("Closed"))),
    priority: v.optional(v.union(v.literal("Critical"), v.literal("High"), v.literal("Medium"), v.literal("Low"))),
    categoryId: v.optional(v.id("categories")),
    assignedAgentId: v.optional(v.id("agents")),
    unassignedOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    let tickets;
    if (args.status) {
      tickets = await ctx.db.query("tickets").withIndex("by_status", (q) => q.eq("status", args.status!)).order("desc").collect();
    } else if (args.assignedAgentId) {
      tickets = await ctx.db.query("tickets").withIndex("by_assignedAgentId", (q) => q.eq("assignedAgentId", args.assignedAgentId!)).order("desc").collect();
    } else if (args.categoryId) {
      tickets = await ctx.db.query("tickets").withIndex("by_categoryId", (q) => q.eq("categoryId", args.categoryId!)).order("desc").collect();
    } else {
      tickets = await ctx.db.query("tickets").order("desc").collect();
    }
    if (args.priority) tickets = tickets.filter((t) => t.priority === args.priority);
    if (args.unassignedOnly) tickets = tickets.filter((t) => !t.assignedAgentId);
    // Check if user is requester (no agent record) and scope to own tickets
    const agent = await ctx.db.query("agents").withIndex("by_userId", (q) => q.eq("userId", identity.subject)).first();
    if (!agent) {
      tickets = tickets.filter((t) => t.requesterId === identity.subject);
    }
    return tickets;
  },
});

export const getById = query({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) return null;
    const agent = await ctx.db.query("agents").withIndex("by_userId", (q) => q.eq("userId", identity.subject)).first();
    if (!agent && ticket.requesterId !== identity.subject) return null;
    return ticket;
  },
});

export const getMyTickets = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db.query("tickets").withIndex("by_requesterId", (q) => q.eq("requesterId", identity.subject)).order("desc").collect();
  },
});

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { openCount: 0, slaCompliancePercent: 0, avgResolutionHours: 0, avgSatisfaction: 0 };
    const allTickets = await ctx.db.query("tickets").collect();
    const openStatuses = ["Open", "Triaged", "InProgress", "OnHold"];
    const openCount = allTickets.filter((t) => openStatuses.includes(t.status)).length;
    const resolved = allTickets.filter((t) => t.resolvedAt);
    const slaCompliant = resolved.filter((t) => t.slaResolutionMet === true).length;
    const slaCompliancePercent = resolved.length > 0 ? Math.round((slaCompliant / resolved.length) * 100) : 100;
    const avgResolutionHours = resolved.length > 0 ? Math.round(resolved.reduce((sum, t) => sum + ((t.resolvedAt! - t.createdAt) / 3600000), 0) / resolved.length * 10) / 10 : 0;
    const ratings = await ctx.db.query("satisfactionRatings").collect();
    const avgSatisfaction = ratings.length > 0 ? Math.round(ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length * 10) / 10 : 0;
    return { openCount, slaCompliancePercent, avgResolutionHours, avgSatisfaction };
  },
});

export const getTeamStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { unassignedCount: 0, slaCompliance: 0, escalationCount: 0, agents: [] };
    const allTickets = await ctx.db.query("tickets").collect();
    const unassignedCount = allTickets.filter((t) => !t.assignedAgentId && t.status === "Open").length;
    const agents = await ctx.db.query("agents").withIndex("by_isActive", (q) => q.eq("isActive", true)).collect();
    const escalations = await ctx.db.query("escalations").collect();
    const unresolvedEscalations = escalations.filter((e) => !e.resolvedAt).length;
    const resolved = allTickets.filter((t) => t.resolvedAt);
    const slaCompliance = resolved.length > 0 ? Math.round(resolved.filter((t) => t.slaResolutionMet === true).length / resolved.length * 100) : 100;
    return { unassignedCount, slaCompliance, escalationCount: unresolvedEscalations, agents: agents.map((a) => ({ _id: a._id, userId: a.userId, department: a.department, currentTicketCount: a.currentTicketCount, maxTicketLoad: a.maxTicketLoad, availabilityStatus: a.availabilityStatus })) };
  },
});

export const getAgentStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const agent = await ctx.db.query("agents").withIndex("by_userId", (q) => q.eq("userId", identity.subject)).first();
    if (!agent) return null;
    const myTickets = await ctx.db.query("tickets").withIndex("by_assignedAgentId", (q) => q.eq("assignedAgentId", agent._id)).collect();
    const activeTickets = myTickets.filter((t) => ["Triaged", "InProgress", "OnHold"].includes(t.status));
    return { agent, activeTickets, ticketsResolved: agent.ticketsResolved, satisfactionAverage: agent.satisfactionAverage ?? 0 };
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    categoryId: v.id("categories"),
    priority: v.union(v.literal("Critical"), v.literal("High"), v.literal("Medium"), v.literal("Low")),
    tags: v.optional(v.array(v.id("tags"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const ticketId = await ctx.db.insert("tickets", {
      ...args,
      status: "Open",
      requesterId: identity.subject,
      createdAt: Date.now(),
    });
    await ctx.db.insert("notifications", {
      userId: identity.subject,
      type: "TicketCreated",
      title: "Ticket Created",
      message: `Your ticket "${args.title}" has been created.`,
      ticketId,
      link: `/my-tickets/${ticketId}`,
      isRead: false,
      createdAt: Date.now(),
    });
    await ctx.db.insert("auditLogs", {
      userId: identity.subject,
      action: "Create",
      entityType: "Ticket",
      entityId: ticketId,
      newValue: JSON.stringify({ title: args.title, priority: args.priority }),
      createdAt: Date.now(),
    });
    return ticketId;
  },
});

export const update = mutation({
  args: {
    ticketId: v.id("tickets"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    priority: v.optional(v.union(v.literal("Critical"), v.literal("High"), v.literal("Medium"), v.literal("Low"))),
    tags: v.optional(v.array(v.id("tags"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new Error("Ticket not found");
    if (ticket.status === "Closed") throw new Error("Cannot modify a closed ticket");
    const agent = await ctx.db.query("agents").withIndex("by_userId", (q) => q.eq("userId", identity.subject)).first();
    if (!agent && ticket.requesterId === identity.subject) {
      if (ticket.status !== "Open") throw new Error("Requester can only update description when status is Open");
      if (args.title || args.categoryId || args.priority || args.tags) throw new Error("Requester can only update description");
    }
    const { ticketId, ...updates } = args;
    const filtered = Object.fromEntries(Object.entries(updates).filter(([, val]) => val !== undefined));
    await ctx.db.patch(ticketId, filtered);
    await ctx.db.insert("auditLogs", { userId: identity.subject, action: "Update", entityType: "Ticket", entityId: ticketId, previousValue: JSON.stringify({ title: ticket.title }), newValue: JSON.stringify(filtered), createdAt: Date.now() });
  },
});

export const updateStatus = mutation({
  args: {
    ticketId: v.id("tickets"),
    status: v.union(v.literal("Open"), v.literal("Triaged"), v.literal("InProgress"), v.literal("OnHold"), v.literal("Resolved"), v.literal("Closed")),
    resolution: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new Error("Ticket not found");
    const allowed = VALID_TRANSITIONS[ticket.status];
    if (!allowed || !allowed.includes(args.status)) throw new Error(`Invalid status transition from ${ticket.status} to ${args.status}`);
    const patch: Record<string, unknown> = { status: args.status };
    if (args.status === "Resolved") {
      patch.resolvedAt = Date.now();
      if (args.resolution) patch.resolution = args.resolution;
      if (ticket.slaResolutionDeadline) patch.slaResolutionMet = Date.now() <= ticket.slaResolutionDeadline;
      if (ticket.assignedAgentId) {
        const agent = await ctx.db.get(ticket.assignedAgentId);
        if (agent) {
          await ctx.db.patch(agent._id, { currentTicketCount: Math.max(0, agent.currentTicketCount - 1), ticketsResolved: agent.ticketsResolved + 1 });
        }
      }
      await ctx.db.insert("notifications", { userId: ticket.requesterId, type: "TicketResolved", title: "Ticket Resolved", message: `Your ticket "${ticket.title}" has been resolved.`, ticketId: args.ticketId, link: `/my-tickets/${args.ticketId}`, isRead: false, createdAt: Date.now() });
      await ctx.db.insert("notifications", { userId: ticket.requesterId, type: "SatisfactionRequest", title: "Rate Your Experience", message: `Please rate your experience with ticket "${ticket.title}".`, ticketId: args.ticketId, link: `/tickets/${args.ticketId}/rate`, isRead: false, createdAt: Date.now() });
    }
    if (args.status === "Closed") {
      patch.closedAt = Date.now();
      if (ticket.assignedAgentId && ticket.status !== "Resolved") {
        const agent = await ctx.db.get(ticket.assignedAgentId);
        if (agent) await ctx.db.patch(agent._id, { currentTicketCount: Math.max(0, agent.currentTicketCount - 1) });
      }
      await ctx.db.insert("notifications", { userId: ticket.requesterId, type: "TicketClosed", title: "Ticket Closed", message: `Your ticket "${ticket.title}" has been closed.`, ticketId: args.ticketId, link: `/my-tickets/${args.ticketId}`, isRead: false, createdAt: Date.now() });
    }
    await ctx.db.patch(args.ticketId, patch);
    await ctx.db.insert("auditLogs", { userId: identity.subject, action: "StatusChange", entityType: "Ticket", entityId: args.ticketId, previousValue: JSON.stringify({ status: ticket.status }), newValue: JSON.stringify({ status: args.status }), createdAt: Date.now() });
  },
});

export const assign = mutation({
  args: {
    ticketId: v.id("tickets"),
    agentId: v.id("agents"),
    forceAssign: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new Error("Ticket not found");
    const agent = await ctx.db.get(args.agentId);
    if (!agent) throw new Error("Agent not found");
    if (agent.currentTicketCount >= agent.maxTicketLoad && !args.forceAssign) throw new Error("Agent at capacity. Use forceAssign to override.");
    // Decrement old agent if reassigning
    if (ticket.assignedAgentId && ticket.assignedAgentId !== args.agentId) {
      const oldAgent = await ctx.db.get(ticket.assignedAgentId);
      if (oldAgent) await ctx.db.patch(oldAgent._id, { currentTicketCount: Math.max(0, oldAgent.currentTicketCount - 1) });
    }
    const patch: Record<string, unknown> = { assignedAgentId: args.agentId };
    if (ticket.status === "Open") {
      patch.status = "Triaged";
      // Apply SLA policy
      const slaPolicy = await ctx.db.query("slaPolicies").withIndex("by_priority", (q) => q.eq("priority", ticket.priority)).collect();
      const defaultPolicy = slaPolicy.find((p) => p.isDefault && p.isActive);
      if (defaultPolicy) {
        const now = Date.now();
        patch.slaPolicyId = defaultPolicy._id;
        patch.slaResponseDeadline = now + defaultPolicy.responseTimeHours * 3600000;
        patch.slaResolutionDeadline = now + defaultPolicy.resolutionTimeHours * 3600000;
      }
    }
    await ctx.db.patch(args.ticketId, patch);
    await ctx.db.patch(args.agentId, { currentTicketCount: agent.currentTicketCount + 1 });
    await ctx.db.insert("notifications", { userId: agent.userId, type: "TicketAssigned", title: "Ticket Assigned", message: `You have been assigned ticket "${ticket.title}".`, ticketId: args.ticketId, link: `/tickets/${args.ticketId}`, isRead: false, createdAt: Date.now() });
    await ctx.db.insert("auditLogs", { userId: identity.subject, action: "Assignment", entityType: "Ticket", entityId: args.ticketId, newValue: JSON.stringify({ agentId: args.agentId }), createdAt: Date.now() });
  },
});