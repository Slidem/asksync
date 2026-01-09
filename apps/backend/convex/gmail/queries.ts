import { Doc, Id } from "../_generated/dataModel";
/* eslint-disable import/order */
import { internalQuery, query } from "../_generated/server";

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

    // Get all tags for display
    const allTagIds = [...new Set(items.flatMap((i) => i.tagIds))];
    const tagDocs = await Promise.all(
      allTagIds.map((id) => ctx.db.get(id as Id<"tags">)),
    );
    const tagMap = new Map(tagDocs.filter(Boolean).map((t) => [t!._id, t!]));

    return items.map((item) => ({
      ...item,
      sourceEmail: connectionEmailMap.get(item.gmailConnectionId) || "Unknown",
      tags: item.tagIds
        .map((id) => tagMap.get(id as Id<"tags">))
        .filter(Boolean)
        .map((t) => ({ _id: t!._id, name: t!.name, color: t!.color })),
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

/**
 * Get urgent attention items for dashboard
 */
export const getUrgentAttentionItems = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id: userId, orgId } = await getUser(ctx);
    const limit = args.limit || 5;

    // Get pending attention items
    const items = await ctx.db
      .query("emailAttentionItems")
      .withIndex("by_user_and_org", (q) =>
        q.eq("userId", userId).eq("orgId", orgId),
      )
      .collect();

    const pendingItems = items.filter((i) => i.status === "pending");

    // Get current timeblock tags
    const now = Date.now();
    const timeblocks = await ctx.db
      .query("timeblocks")
      .withIndex("by_org_and_creator", (q) =>
        q.eq("orgId", orgId).eq("createdBy", userId),
      )
      .collect();

    const currentTimeblock = timeblocks.find(
      (tb) => tb.startTime <= now && tb.endTime >= now,
    );
    const currentTags = currentTimeblock?.tagIds || [];

    // Get all tags to calculate urgency
    const allTagIds = [...new Set(pendingItems.flatMap((i) => i.tagIds))];
    const tagDocs = await Promise.all(
      allTagIds.map((id) => ctx.db.get(id as Id<"tags">)),
    );
    const tagMap = new Map(tagDocs.filter(Boolean).map((t) => [t!._id, t!]));

    // Use stored expectedAnswerTime and isOverdue (calculated on creation/recalc)
    // For items without stored values (legacy), calculate on-the-fly
    const itemsWithUrgency = pendingItems.map((item) => {
      const matchesCurrentBlock = item.tagIds.some((id) =>
        currentTags.includes(id),
      );

      // Fall back to on-the-fly calculation for legacy items
      let expectedAnswerTime = item.expectedAnswerTime;
      let isOverdue = item.isOverdue;
      if (expectedAnswerTime === undefined) {
        const responseTimes = item.tagIds
          .map((id) => tagMap.get(id as Id<"tags">)?.responseTimeMinutes)
          .filter((t): t is number => t !== undefined);
        const fastestResponse =
          responseTimes.length > 0 ? Math.min(...responseTimes) : 60;
        expectedAnswerTime = item.receivedAt + fastestResponse * 60 * 1000;
        isOverdue = expectedAnswerTime < now;
      }

      return {
        ...item,
        matchesCurrentBlock,
        expectedAnswerTime,
        isOverdue: isOverdue ?? false,
        urgencyScore: isOverdue ? -1 : expectedAnswerTime - now,
      };
    });

    // Sort by urgency (overdue first, then by expected time)
    itemsWithUrgency.sort((a, b) => a.urgencyScore - b.urgencyScore);

    // Get connection emails and return top items
    const connectionIds = [
      ...new Set(
        itemsWithUrgency.slice(0, limit).map((i) => i.gmailConnectionId),
      ),
    ];
    const connections = await Promise.all(
      connectionIds.map((id) => ctx.db.get(id)),
    );
    const connectionEmailMap = new Map(
      connections.filter(Boolean).map((c) => [c!._id, c!.googleEmail]),
    );

    return itemsWithUrgency.slice(0, limit).map((item) => ({
      _id: item._id,
      senderEmail: item.senderEmail,
      senderName: item.senderName,
      subject: item.subject,
      snippet: item.snippet,
      htmlBody: item.htmlBody,
      receivedAt: item.receivedAt,
      expectedAnswerTime: item.expectedAnswerTime,
      isOverdue: item.isOverdue,
      matchesCurrentBlock: item.matchesCurrentBlock,
      status: item.status,
      sourceEmail: connectionEmailMap.get(item.gmailConnectionId) || "Unknown",
      tags: item.tagIds
        .map((id) => tagMap.get(id as Id<"tags">))
        .filter(Boolean)
        .map((t) => ({ _id: t!._id, name: t!.name, color: t!.color })),
    }));
  },
});

/**
 * Get attention items for current focus panel
 */
export const getCurrentFocusAttentionItems = query({
  args: {
    timeblockIds: v.optional(v.array(v.id("timeblocks"))),
  },
  handler: async (ctx, args) => {
    const { id: userId, orgId } = await getUser(ctx);

    // Get timeblock tags
    const allTagIds = new Set<string>();
    if (args.timeblockIds && args.timeblockIds.length > 0) {
      const timeblocks = await Promise.all(
        args.timeblockIds.map((id) => ctx.db.get(id)),
      );
      for (const tb of timeblocks.filter(Boolean)) {
        for (const tagId of tb!.tagIds) {
          allTagIds.add(tagId);
        }
      }
    } else {
      // Find current timeblocks
      const now = Date.now();
      const timeblocks = await ctx.db
        .query("timeblocks")
        .withIndex("by_org_and_creator", (q) =>
          q.eq("orgId", orgId).eq("createdBy", userId),
        )
        .collect();

      const current = timeblocks.filter(
        (tb) => tb.startTime <= now && tb.endTime >= now,
      );
      for (const tb of current) {
        for (const tagId of tb.tagIds) {
          allTagIds.add(tagId);
        }
      }
    }

    if (allTagIds.size === 0) return [];

    // Get pending attention items
    const items = await ctx.db
      .query("emailAttentionItems")
      .withIndex("by_user_and_org", (q) =>
        q.eq("userId", userId).eq("orgId", orgId),
      )
      .collect();

    // Get all tags for filtering and urgency
    const allItemTagIds = [...new Set(items.flatMap((i) => i.tagIds))];
    const tagDocs = await Promise.all(
      allItemTagIds.map((id) => ctx.db.get(id as Id<"tags">)),
    );
    const tagMap = new Map(tagDocs.filter(Boolean).map((t) => [t!._id, t!]));

    // Filter pending items matching tags or on-demand
    const filtered = items.filter((item) => {
      if (item.status !== "pending") return false;

      return item.tagIds.some((tagId) => {
        if (allTagIds.has(tagId)) return true;
        const tag = tagMap.get(tagId as Id<"tags">);
        return tag?.answerMode === "on-demand";
      });
    });

    // Calculate urgency with fallback for legacy items
    const now = Date.now();
    const withUrgency = filtered.map((item) => {
      let expectedAnswerTime = item.expectedAnswerTime;
      let isOverdue = item.isOverdue;
      if (expectedAnswerTime === undefined) {
        const responseTimes = item.tagIds
          .map((id) => tagMap.get(id as Id<"tags">)?.responseTimeMinutes)
          .filter((t): t is number => t !== undefined);
        const fastestResponse =
          responseTimes.length > 0 ? Math.min(...responseTimes) : 60;
        expectedAnswerTime = item.receivedAt + fastestResponse * 60 * 1000;
        isOverdue = expectedAnswerTime < now;
      }
      return { ...item, expectedAnswerTime, isOverdue: isOverdue ?? false };
    });

    withUrgency.sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      return a.expectedAnswerTime - b.expectedAnswerTime;
    });

    // Get connection emails
    const connectionIds = [
      ...new Set(withUrgency.map((i) => i.gmailConnectionId)),
    ];
    const connections = await Promise.all(
      connectionIds.map((id) => ctx.db.get(id)),
    );
    const connectionEmailMap = new Map(
      connections.filter(Boolean).map((c) => [c!._id, c!.googleEmail]),
    );

    return withUrgency.map((item) => ({
      _id: item._id,
      senderEmail: item.senderEmail,
      senderName: item.senderName,
      subject: item.subject,
      snippet: item.snippet,
      htmlBody: item.htmlBody,
      receivedAt: item.receivedAt,
      expectedAnswerTime: item.expectedAnswerTime,
      isOverdue: item.isOverdue,
      status: item.status,
      sourceEmail: connectionEmailMap.get(item.gmailConnectionId) || "Unknown",
      tags: item.tagIds
        .map((id) => tagMap.get(id as Id<"tags">))
        .filter(Boolean)
        .map((t) => ({ _id: t!._id, name: t!.name, color: t!.color })),
    }));
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
