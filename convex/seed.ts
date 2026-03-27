import { mutation, query } from "./_generated/server";

export const checkSeedData = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").collect();
    const agents = await ctx.db.query("agents").collect();
    const slaPolicies = await ctx.db.query("slaPolicies").collect();
    const tags = await ctx.db.query("tags").collect();
    const tickets = await ctx.db.query("tickets").collect();
    return {
      categories: categories.length,
      agents: agents.map(a => ({ id: a._id, dept: a.department, userId: a.userId })),
      slaPolicies: slaPolicies.length,
      tags: tags.length,
      tickets: tickets.length,
    };
  },
});

export const seedAgents = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("agents").take(1);
    if (existing.length > 0) return;
    const now = Date.now();
    await ctx.db.insert("agents", { userId: "user_3BVWDdT9lDOiybeERx2eddBQZTB", department: "Admin", specialties: ["system-administration", "security", "compliance"], maxTicketLoad: 20, currentTicketCount: 0, availabilityStatus: "Available", ticketsResolved: 0, isActive: true, createdAt: now });
    await ctx.db.insert("agents", { userId: "user_3BVrrXWlD8jB6WASwzhLALgoPSC", department: "Team Lead", specialties: ["networking", "hardware", "team-management"], maxTicketLoad: 15, currentTicketCount: 0, availabilityStatus: "Available", ticketsResolved: 0, isActive: true, createdAt: now });
    await ctx.db.insert("agents", { userId: "user_3BVrrbfI7htSgPf3LXWHm4tooS2", department: "IT Support", specialties: ["software", "windows", "printers"], maxTicketLoad: 10, currentTicketCount: 0, availabilityStatus: "Available", ticketsResolved: 0, isActive: true, createdAt: now });
  },
});

export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    // Idempotent — skip if already seeded
    const existingCategories = await ctx.db.query("categories").take(1);
    if (existingCategories.length > 0) return;

    const now = Date.now();

    // Seed categories
    const hardwareId = await ctx.db.insert("categories", {
      name: "Hardware",
      description: "Physical equipment issues — laptops, monitors, printers, peripherals",
      defaultPriority: "Medium",
      defaultSLAHours: 24,
      icon: "monitor",
      isActive: true,
      createdAt: now,
    });
    const softwareId = await ctx.db.insert("categories", {
      name: "Software",
      description: "Application bugs, installation, licensing, and configuration issues",
      defaultPriority: "Medium",
      defaultSLAHours: 24,
      icon: "code",
      isActive: true,
      createdAt: now,
    });
    const networkId = await ctx.db.insert("categories", {
      name: "Network",
      description: "Connectivity, VPN, Wi-Fi, and network infrastructure issues",
      defaultPriority: "High",
      defaultSLAHours: 8,
      icon: "wifi",
      isActive: true,
      createdAt: now,
    });
    const accessId = await ctx.db.insert("categories", {
      name: "Access",
      description: "Account access, permissions, password resets, and provisioning",
      defaultPriority: "High",
      defaultSLAHours: 4,
      icon: "key",
      isActive: true,
      createdAt: now,
    });
    await ctx.db.insert("categories", {
      name: "Other",
      description: "General IT requests that don't fit other categories",
      defaultPriority: "Low",
      defaultSLAHours: 48,
      icon: "help-circle",
      isActive: true,
      createdAt: now,
    });

    // Seed SLA policies
    await ctx.db.insert("slaPolicies", {
      name: "Critical SLA",
      priority: "Critical",
      responseTimeHours: 1,
      resolutionTimeHours: 4,
      escalateAfterResponseHours: 2,
      escalateAfterResolutionHours: 6,
      escalateToRole: "Admin",
      isDefault: true,
      isActive: true,
      createdAt: now,
    });
    await ctx.db.insert("slaPolicies", {
      name: "High Priority SLA",
      priority: "High",
      responseTimeHours: 4,
      resolutionTimeHours: 8,
      escalateAfterResponseHours: 6,
      escalateAfterResolutionHours: 12,
      escalateToRole: "TeamLead",
      isDefault: true,
      isActive: true,
      createdAt: now,
    });
    await ctx.db.insert("slaPolicies", {
      name: "Medium Priority SLA",
      priority: "Medium",
      responseTimeHours: 8,
      resolutionTimeHours: 24,
      escalateAfterResponseHours: 12,
      escalateAfterResolutionHours: 30,
      escalateToRole: "TeamLead",
      isDefault: true,
      isActive: true,
      createdAt: now,
    });
    await ctx.db.insert("slaPolicies", {
      name: "Low Priority SLA",
      priority: "Low",
      responseTimeHours: 24,
      resolutionTimeHours: 48,
      isDefault: true,
      isActive: true,
      createdAt: now,
    });

    // Seed tags
    await ctx.db.insert("tags", { name: "Urgent", color: "#EF4444", description: "Requires immediate attention", usageCount: 0, createdAt: now });
    await ctx.db.insert("tags", { name: "Bug", color: "#F59E0B", description: "Software bug or defect", usageCount: 0, createdAt: now });
    await ctx.db.insert("tags", { name: "Feature Request", color: "#3B82F6", description: "Request for new feature or enhancement", usageCount: 0, createdAt: now });
    await ctx.db.insert("tags", { name: "Onboarding", color: "#8B5CF6", description: "New employee setup and onboarding", usageCount: 0, createdAt: now });
    await ctx.db.insert("tags", { name: "Security", color: "#DC2626", description: "Security-related issue", usageCount: 0, createdAt: now });
  },
});