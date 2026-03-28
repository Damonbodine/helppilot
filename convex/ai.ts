import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

async function callOpenRouter(prompt: string, systemPrompt: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not configured");
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "nvidia/nemotron-3-super-120b-a12b:free",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} ${text}`);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export const triageTicket = action({
  args: { title: v.string(), description: v.string() },
  handler: async (ctx, args) => {
    const categories = await ctx.runQuery(api.categories.list, { activeOnly: true });
    const agents = await ctx.runQuery(api.agents.list, {});
    const tags = await ctx.runQuery(api.tags.list, {});
    const categoryNames = categories.map((c: { _id: string; name: string }) => `${c._id}:${c.name}`).join(", ");
    const agentInfo = agents.map((a: { _id: string; department: string; specialties: string[]; currentTicketCount: number; maxTicketLoad: number }) => `${a._id}:${a.department}(${a.specialties.join("/")})[${a.currentTicketCount}/${a.maxTicketLoad}]`).join(", ");
    const tagNames = tags.map((t: { _id: string; name: string }) => `${t._id}:${t.name}`).join(", ");
    const systemPrompt = `You are an IT helpdesk triage AI. Analyze tickets and suggest triage decisions. Respond ONLY with valid JSON, no markdown.`;
    const prompt = `Analyze this ticket and suggest triage:
Title: ${args.title}
Description: ${args.description}

Available categories: ${categoryNames}
Available agents: ${agentInfo}
Available tags: ${tagNames}

Respond with JSON: {"categoryId":"<id>","categoryName":"<name>","priority":"Critical|High|Medium|Low","priorityReason":"<why>","tagIds":["<id>"],"tagNames":["<name>"],"agentId":"<id or null>","agentReason":"<why>","summary":"<1-line triage summary>"}`;
    const result = await callOpenRouter(prompt, systemPrompt);
    try {
      const cleaned = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleaned);
    } catch {
      return { error: "Failed to parse AI response", raw: result };
    }
  },
});

export const suggestResolutions = action({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, args) => {
    const ticket = await ctx.runQuery(api.tickets.getById, { ticketId: args.ticketId });
    if (!ticket) throw new Error("Ticket not found");
    const resolvedTickets = await ctx.runQuery(api.tickets.searchResolved, { search: ticket.title });
    const kbArticles = await ctx.runQuery(api.knowledgeArticles.list, { status: "Published", search: ticket.title.split(" ").slice(0, 3).join(" ") });
    const context: string[] = [];
    for (const t of resolvedTickets.slice(0, 5)) {
      context.push(`[Ticket] "${t.title}": ${t.resolution ?? t.description}`);
    }
    for (const a of kbArticles.slice(0, 5)) {
      context.push(`[KB] "${a.title}": ${a.excerpt}`);
    }
    if (context.length === 0) {
      return { suggestions: [], message: "No similar tickets or articles found." };
    }
    const systemPrompt = `You are an IT helpdesk resolution assistant. Suggest solutions based on past tickets and knowledge base. Respond ONLY with valid JSON, no markdown.`;
    const prompt = `Current ticket:
Title: ${ticket.title}
Description: ${ticket.description}

Similar past resolutions and KB articles:
${context.join("\n")}

Respond with JSON: {"suggestions":[{"title":"<solution title>","summary":"<solution steps>","relevanceScore":<0.0-1.0>,"source":"<ticket or kb>"}]} (max 3 suggestions, sorted by relevance)`;
    const result = await callOpenRouter(prompt, systemPrompt);
    try {
      const cleaned = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleaned);
    } catch {
      return { suggestions: [], error: "Failed to parse AI response", raw: result };
    }
  },
});

export const draftResponse = action({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, args) => {
    const ticket = await ctx.runQuery(api.tickets.getById, { ticketId: args.ticketId });
    if (!ticket) throw new Error("Ticket not found");
    const systemPrompt = `You are a professional IT helpdesk agent drafting an initial response to a ticket requester. Be helpful, empathetic, and clear. For common issues provide solution steps. For complex issues acknowledge receipt and set expectations.`;
    const prompt = `Draft an initial response for this ticket:
Title: ${ticket.title}
Description: ${ticket.description}
Priority: ${ticket.priority}
Status: ${ticket.status}

Write a professional response that:
- Acknowledges the issue
- If common issue: provides step-by-step solution
- If complex issue: acknowledges receipt, explains next steps, sets timeline expectations
- Uses a friendly but professional tone

Respond with ONLY the response text, no JSON wrapping.`;
    const result = await callOpenRouter(prompt, systemPrompt);
    return { draft: result.trim() };
  },
});

export const generateKbArticle = action({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, args) => {
    const ticket = await ctx.runQuery(api.tickets.getById, { ticketId: args.ticketId });
    if (!ticket) throw new Error("Ticket not found");
    const replies = await ctx.runQuery(api.ticketReplies.getConversation, { ticketId: args.ticketId });
    const conversation = replies.map((r: { authorId: string; content: string }) => `[${r.authorId === ticket.requesterId ? "Requester" : "Agent"}]: ${r.content}`).join("\n");
    const systemPrompt = `You are a technical writer creating knowledge base articles from resolved IT tickets. Respond ONLY with valid JSON, no markdown.`;
    const prompt = `Generate a KB article from this resolved ticket:
Title: ${ticket.title}
Description: ${ticket.description}
Resolution: ${ticket.resolution ?? "See conversation"}
Priority: ${ticket.priority}

Conversation:
${conversation || "(no replies)"}

Respond with JSON: {"title":"<article title>","content":"<full article in markdown>","excerpt":"<2-3 sentence summary>"}
The content should cover: Problem Description, Symptoms, Root Cause, Solution Steps, Prevention Tips.`;
    const result = await callOpenRouter(prompt, systemPrompt);
    try {
      const cleaned = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleaned);
    } catch {
      return { error: "Failed to parse AI response", raw: result };
    }
  },
});
