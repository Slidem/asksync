/* eslint-disable import/order */
import { internalQuery, query } from "../_generated/server";

import { Doc } from "../_generated/dataModel";
import { getUser } from "../auth/user";
import { v } from "convex/values";

/**
 * List all Google Calendar connections for the current user
 * Returns safe data (no tokens exposed)
 */
export const listConnections = query({
  args: {},
  handler: async (ctx) => {
    const { id: userId, orgId } = await getUser(ctx);

    const connections = await ctx.db
      .query("googleCalendarConnections")
      .withIndex("by_user_and_org", (q) =>
        q.eq("userId", userId).eq("orgId", orgId),
      )
      .collect();

    // Return without sensitive token data
    return connections.map((conn) => ({
      _id: conn._id,
      _creationTime: conn._creationTime,
      googleAccountId: conn.googleAccountId,
      googleEmail: conn.googleEmail,
      visibility: conn.visibility,
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
 * Get a specific connection by ID (for current user only)
 * Returns safe data (no tokens exposed)
 */
export const getConnection = query({
  args: { connectionId: v.id("googleCalendarConnections") },
  handler: async (ctx, args) => {
    const { id: userId, orgId } = await getUser(ctx);
    const connection = await ctx.db.get(args.connectionId);

    if (
      !connection ||
      connection.userId !== userId ||
      connection.orgId !== orgId
    ) {
      throw new Error("Connection not found");
    }

    // Return without sensitive token data
    return {
      _id: connection._id,
      _creationTime: connection._creationTime,
      googleAccountId: connection.googleAccountId,
      googleEmail: connection.googleEmail,
      visibility: connection.visibility,
      syncStatus: connection.syncStatus,
      lastSyncedAt: connection.lastSyncedAt,
      lastErrorMessage: connection.lastErrorMessage,
      isEnabled: connection.isEnabled,
      createdAt: connection.createdAt,
      updatedAt: connection.updatedAt,
    };
  },
});

/**
 * Get sync status for a connection
 */
export const getSyncStatus = query({
  args: { connectionId: v.id("googleCalendarConnections") },
  handler: async (ctx, args) => {
    const { id: userId } = await getUser(ctx);
    const connection = await ctx.db.get(args.connectionId);

    if (!connection || connection.userId !== userId) {
      throw new Error("Connection not found");
    }

    return {
      lastSyncedAt: connection.lastSyncedAt,
      syncStatus: connection.syncStatus,
      lastError: connection.lastErrorMessage,
      webhookActive:
        connection.webhookChannelId !== undefined &&
        (connection.webhookExpiresAt ?? 0) > Date.now(),
    };
  },
});

// Internal queries (for use by actions and internal mutations)

/**
 * Get full connection data including tokens (internal only)
 */
export const getConnectionInternal = internalQuery({
  args: { connectionId: v.id("googleCalendarConnections") },
  handler: async (
    ctx,
    args,
  ): Promise<Doc<"googleCalendarConnections"> | null> => {
    return await ctx.db.get(args.connectionId);
  },
});

/**
 * Get connection by webhook channel ID (for webhook handler)
 */
export const getConnectionByWebhookChannel = internalQuery({
  args: { channelId: v.string() },
  handler: async (
    ctx,
    args,
  ): Promise<Doc<"googleCalendarConnections"> | null> => {
    return await ctx.db
      .query("googleCalendarConnections")
      .withIndex("by_webhook_channel", (q) =>
        q.eq("webhookChannelId", args.channelId),
      )
      .first();
  },
});

/**
 * Get all connections for a user (internal)
 */
export const getConnectionsForUser = internalQuery({
  args: { userId: v.string(), orgId: v.string() },
  handler: async (ctx, args): Promise<Doc<"googleCalendarConnections">[]> => {
    return await ctx.db
      .query("googleCalendarConnections")
      .withIndex("by_user_and_org", (q) =>
        q.eq("userId", args.userId).eq("orgId", args.orgId),
      )
      .collect();
  },
});

/**
 * Get all active connections (for cron jobs)
 */
export const getActiveConnections = internalQuery({
  args: {},
  handler: async (ctx): Promise<Doc<"googleCalendarConnections">[]> => {
    return await ctx.db
      .query("googleCalendarConnections")
      .withIndex("by_sync_status", (q) => q.eq("syncStatus", "active"))
      .collect();
  },
});

/**
 * Get connections with expiring webhooks (for renewal cron)
 */
export const getConnectionsWithExpiringWebhooks = internalQuery({
  args: { expirationThreshold: v.number() },
  handler: async (ctx, args): Promise<Doc<"googleCalendarConnections">[]> => {
    const connections = await ctx.db
      .query("googleCalendarConnections")
      .withIndex("by_sync_status", (q) => q.eq("syncStatus", "active"))
      .collect();

    // Filter to those with webhooks expiring before threshold
    return connections.filter(
      (c) =>
        c.webhookExpiresAt !== undefined &&
        c.webhookExpiresAt < args.expirationThreshold,
    );
  },
});

/**
 * Get connections with expiring tokens (for token refresh cron)
 */
export const getConnectionsWithExpiringTokens = internalQuery({
  args: { expirationThreshold: v.number() },
  handler: async (ctx, args): Promise<Doc<"googleCalendarConnections">[]> => {
    const connections = await ctx.db
      .query("googleCalendarConnections")
      .withIndex("by_sync_status", (q) => q.eq("syncStatus", "active"))
      .collect();

    // Filter to those with tokens expiring before threshold
    return connections.filter(
      (c) => c.tokenExpiresAt < args.expirationThreshold,
    );
  },
});
