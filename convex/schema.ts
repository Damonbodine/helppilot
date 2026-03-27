import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tickets: defineTable({
    title: v.string(),
    description: v.string(),
    status: v.union(v.literal("Open"), v.literal("Triaged"), v.literal("InProgress"), v.literal("OnHold"), v.literal("Resolved"), v.literal("Closed")),
    priority: v.union(v.literal("Critical"), v.literal("High"), v.literal("Medium"), v.literal("Low")),
    categoryId: v.id("categories"),
    requesterId: v.string(),
    assignedAgentId: v.optional(v.id("agents")),
    slaPolicyId: v.optional(v.id("slaPolicies")),
    slaResponseDeadline: v.optional(v.number()),
    slaResolutionDeadline: v.optional(v.number()),
    slaResponseMet: v.optional(v.boolean()),
    slaResolutionMet: v.optional(v.boolean()),
    resolution: v.optional(v.string()),
    tags: v.optional(v.array(v.id("tags"))),
    firstResponseAt: v.optional(v.number()),
    resolvedAt: v.optional(v.number()),
    closedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_categoryId", ["categoryId"])
    .index("by_requesterId", ["requesterId"])
    .index("by_assignedAgentId", ["assignedAgentId"])
    .index("by_createdAt", ["createdAt"]),
  ticketReplies: defineTable({
    ticketId: v.id("tickets"),
    authorId: v.string(),
    content: v.string(),
    isInternal: v.boolean(),
    attachmentUrls: v.optional(v.array(v.string())),
    attachmentNames: v.optional(v.array(v.string())),
    editedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_ticketId", ["ticketId"])
    .index("by_authorId", ["authorId"]),
  categories: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    defaultPriority: v.union(v.literal("Critical"), v.literal("High"), v.literal("Medium"), v.literal("Low")),
    defaultSLAHours: v.number(),
    parentCategoryId: v.optional(v.id("categories")),
    icon: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_parentCategoryId", ["parentCategoryId"])
    .index("by_isActive", ["isActive"]),
  slaPolicies: defineTable({
    name: v.string(),
    priority: v.union(v.literal("Critical"), v.literal("High"), v.literal("Medium"), v.literal("Low")),
    responseTimeHours: v.number(),
    resolutionTimeHours: v.number(),
    escalateAfterResponseHours: v.optional(v.number()),
    escalateAfterResolutionHours: v.optional(v.number()),
    escalateToRole: v.optional(v.union(v.literal("TeamLead"), v.literal("Admin"))),
    isDefault: v.boolean(),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_priority", ["priority"])
    .index("by_isDefault", ["isDefault"]),
  knowledgeArticles: defineTable({
    title: v.string(),
    content: v.string(),
    excerpt: v.string(),
    categoryId: v.id("categories"),
    authorId: v.string(),
    status: v.union(v.literal("Draft"), v.literal("Published"), v.literal("Archived")),
    tags: v.optional(v.array(v.id("tags"))),
    viewCount: v.number(),
    helpfulCount: v.number(),
    notHelpfulCount: v.number(),
    publishedAt: v.optional(v.number()),
    lastRevisedAt: v.optional(v.number()),
    relatedArticleIds: v.optional(v.array(v.id("knowledgeArticles"))),
    createdAt: v.number(),
  })
    .index("by_categoryId", ["categoryId"])
    .index("by_authorId", ["authorId"])
    .index("by_status", ["status"]),
  agents: defineTable({
    userId: v.string(),
    department: v.string(),
    specialties: v.array(v.string()),
    maxTicketLoad: v.number(),
    currentTicketCount: v.number(),
    availabilityStatus: v.union(v.literal("Available"), v.literal("Busy"), v.literal("Away"), v.literal("Offline")),
    averageResolutionHours: v.optional(v.number()),
    ticketsResolved: v.number(),
    satisfactionAverage: v.optional(v.number()),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_isActive", ["isActive"]),
  escalations: defineTable({
    ticketId: v.id("tickets"),
    fromAgentId: v.optional(v.id("agents")),
    toAgentId: v.optional(v.id("agents")),
    toRole: v.optional(v.union(v.literal("TeamLead"), v.literal("Admin"))),
    reason: v.string(),
    type: v.union(v.literal("Manual"), v.literal("SLABreach"), v.literal("Reassignment")),
    resolvedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_ticketId", ["ticketId"]),
  tags: defineTable({
    name: v.string(),
    color: v.string(),
    description: v.optional(v.string()),
    usageCount: v.number(),
    createdAt: v.number(),
  }),
  notifications: defineTable({
    userId: v.string(),
    type: v.union(v.literal("TicketCreated"), v.literal("TicketAssigned"), v.literal("TicketUpdated"), v.literal("TicketResolved"), v.literal("TicketClosed"), v.literal("SLAWarning"), v.literal("SLABreached"), v.literal("EscalationAlert"), v.literal("NewReply"), v.literal("SatisfactionRequest"), v.literal("SystemAlert")),
    title: v.string(),
    message: v.string(),
    ticketId: v.optional(v.id("tickets")),
    link: v.optional(v.string()),
    isRead: v.boolean(),
    readAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_isRead", ["userId", "isRead"]),
  auditLogs: defineTable({
    userId: v.string(),
    action: v.union(v.literal("Create"), v.literal("Update"), v.literal("Delete"), v.literal("StatusChange"), v.literal("Assignment"), v.literal("Escalation"), v.literal("Login"), v.literal("SLABreach")),
    entityType: v.string(),
    entityId: v.string(),
    previousValue: v.optional(v.string()),
    newValue: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_entityType", ["entityType"])
    .index("by_action", ["action"])
    .index("by_createdAt", ["createdAt"]),
  satisfactionRatings: defineTable({
    ticketId: v.id("tickets"),
    requesterId: v.string(),
    agentId: v.id("agents"),
    rating: v.number(),
    comment: v.optional(v.string()),
    isPublic: v.boolean(),
    updatedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_ticketId", ["ticketId"])
    .index("by_requesterId", ["requesterId"])
    .index("by_agentId", ["agentId"]),
});