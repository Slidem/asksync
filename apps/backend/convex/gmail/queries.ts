/* eslint-disable import/order */
import { internalQuery, query } from "../_generated/server";

import { Doc } from "../_generated/dataModel";
import { getUser } from "../auth/user";
import { v } from "convex/values";

/**
 * List all Gmail connections for the current user
 * Returns safe data (no tokens exposed)
 */
export const listConnections = query({
  args: {},
  handler: async (ctx) => {
    const { id: userId, orgId } = await getUser(ctx);

    const connections = await ctx.db
      .query("gmailConnections")
      .withIndex("by_user_and_org", (q) =>
        q.eq("userId", userId).eq("orgId", orgId),
      )
      .collect();

    return connections.map((conn) => ({
      _id: conn._id,
      _creationTime: conn._creationTime,
      googleAccountId: conn.googleAccountId,
      googleEmail: conn.googleEmail,
      syncStatus: conn.syncStatus,
      lastSyncedAt: conn.lastSyncedAt,
      lastErrorMessage: conn.lastErrorMessage,
      isEnabled: conn.isEnabled,
      createdAt: conn.createdAt,
      updatedAt: conn.updatedAt,
    }));
  },
});

/**
 * List conversion rules for a connection
 */
export const listRules = query({
  args: { connectionId: v.optional(v.id("gmailConnections")) },
  handler: async (ctx, args) => {
    const { id: userId, orgId } = await getUser(ctx);

    if (args.connectionId) {
      const connection = await ctx.db.get(args.connectionId);
      if (!connection || connection.userId !== userId) {
        return [];
      }

      return await ctx.db
        .query("emailConversionRules")
        .withIndex("by_gmail_connection", (q) =>
          q.eq("gmailConnectionId", args.connectionId!),
        )
        .collect();
    }

    // Return all rules for user
    return await ctx.db
      .query("emailConversionRules")
      .withIndex("by_user_and_org", (q) =>
        q.eq("userId", userId).eq("orgId", orgId),
      )
      .collect();
  },
});

/**
 * List attention items for the current user
 */
export const listAttentionItems = query({
  args: {
    status: v.optional(v.union(v.literal("pending"), v.literal("resolved"))),
    connectionId: v.optional(v.id("gmailConnections")),
  },
  handler: async (ctx, args) => {
    const { id: userId, orgId } = await getUser(ctx);

    let items: Doc<"emailAttentionItems">[];

    if (args.connectionId) {
      items = await ctx.db
        .query("emailAttentionItems")
        .withIndex("by_gmail_connection", (q) =>
          q.eq("gmailConnectionId", args.connectionId!),
        )
        .collect();
    } else {
      items = await ctx.db
        .query("emailAttentionItems")
        .withIndex("by_user_and_org", (q) =>
          q.eq("userId", userId).eq("orgId", orgId),
        )
        .collect();
    }

    // Filter by status if provided
    if (args.status) {
      items = items.filter((item) => item.status === args.status);
    }

    // Get connection emails for display
    const connectionIds = [...new Set(items.map((i) => i.gmailConnectionId))];
    const connections = await Promise.all(
      connectionIds.map((id) => ctx.db.get(id)),
    );
    const connectionEmailMap = new Map(
      connections.filter(Boolean).map((c) => [c!._id, c!.googleEmail]),
    );

    // Sort by receivedAt descending
    items.sort((a, b) => b.receivedAt - a.receivedAt);

    return items.map((item) => ({
      ...item,
      sourceEmail: connectionEmailMap.get(item.gmailConnectionId) || "Unknown",
    }));
  },
});

/**
 * Get attention item counts
 */
export const getAttentionItemCounts = query({
  args: {},
  handler: async (ctx) => {
    const { id: userId, orgId } = await getUser(ctx);

    const items = await ctx.db
      .query("emailAttentionItems")
      .withIndex("by_user_and_org", (q) =>
        q.eq("userId", userId).eq("orgId", orgId),
      )
      .collect();

    return {
      pending: items.filter((i) => i.status === "pending").length,
      resolved: items.filter((i) => i.status === "resolved").length,
      total: items.length,
    };
  },
});

// Internal queries

/**
 * Get full connection data including tokens (internal only)
 */
export const getConnectionInternal = internalQuery({
  args: { connectionId: v.id("gmailConnections") },
  handler: async (ctx, args): Promise<Doc<"gmailConnections"> | null> => {
    return await ctx.db.get(args.connectionId);
  },
});

/**
 * Get connection by Google account ID (for OAuth dedup)
 */
export const getConnectionByGoogleAccount = internalQuery({
  args: { googleAccountId: v.string() },
  handler: async (ctx, args): Promise<Doc<"gmailConnections"> | null> => {
    return await ctx.db
      .query("gmailConnections")
      .withIndex("by_google_account", (q) =>
        q.eq("googleAccountId", args.googleAccountId),
      )
      .first();
  },
});

/**
 * Get all active Gmail connections (for cron jobs)
 */
export const getActiveConnections = internalQuery({
  args: {},
  handler: async (ctx): Promise<Doc<"gmailConnections">[]> => {
    return await ctx.db
      .query("gmailConnections")
      .withIndex("by_sync_status", (q) => q.eq("syncStatus", "active"))
      .collect();
  },
});

/**
 * Get connections with expiring tokens (for token refresh cron)
 */
export const getConnectionsWithExpiringTokens = internalQuery({
  args: { expirationThreshold: v.number() },
  handler: async (ctx, args): Promise<Doc<"gmailConnections">[]> => {
    const connections = await ctx.db
      .query("gmailConnections")
      .withIndex("by_sync_status", (q) => q.eq("syncStatus", "active"))
      .collect();

    return connections.filter(
      (c) => c.tokenExpiresAt < args.expirationThreshold,
    );
  },
});

/**
 * Get rules for a connection (internal)
 */
export const getRulesForConnection = internalQuery({
  args: { connectionId: v.id("gmailConnections") },
  handler: async (ctx, args): Promise<Doc<"emailConversionRules">[]> => {
    const rules = await ctx.db
      .query("emailConversionRules")
      .withIndex("by_gmail_connection", (q) =>
        q.eq("gmailConnectionId", args.connectionId),
      )
      .collect();

    // Sort by priority descending (higher priority first)
    return rules
      .filter((r) => r.isEnabled)
      .sort((a, b) => b.priority - a.priority);
  },
});

/**
 * Check if attention item already exists for this message
 */
export const getAttentionItemByMessageId = internalQuery({
  args: { gmailMessageId: v.string() },
  handler: async (ctx, args): Promise<Doc<"emailAttentionItems"> | null> => {
    return await ctx.db
      .query("emailAttentionItems")
      .withIndex("by_gmail_message", (q) =>
        q.eq("gmailMessageId", args.gmailMessageId),
      )
      .first();
  },
});
