/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agents from "../agents.js";
import type * as ai from "../ai.js";
import type * as auditLogs from "../auditLogs.js";
import type * as categories from "../categories.js";
import type * as escalations from "../escalations.js";
import type * as knowledgeArticles from "../knowledgeArticles.js";
import type * as notifications from "../notifications.js";
import type * as satisfactionRatings from "../satisfactionRatings.js";
import type * as seed from "../seed.js";
import type * as slaPolicies from "../slaPolicies.js";
import type * as tags from "../tags.js";
import type * as ticketReplies from "../ticketReplies.js";
import type * as tickets from "../tickets.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  agents: typeof agents;
  ai: typeof ai;
  auditLogs: typeof auditLogs;
  categories: typeof categories;
  escalations: typeof escalations;
  knowledgeArticles: typeof knowledgeArticles;
  notifications: typeof notifications;
  satisfactionRatings: typeof satisfactionRatings;
  seed: typeof seed;
  slaPolicies: typeof slaPolicies;
  tags: typeof tags;
  ticketReplies: typeof ticketReplies;
  tickets: typeof tickets;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
