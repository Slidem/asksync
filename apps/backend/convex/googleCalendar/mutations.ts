/* eslint-disable import/order */
import { MutationCtx, internalMutation, mutation } from "../_generated/server";

import { GoogleEventData } from "./types";
import { Id } from "../_generated/dataModel";
import { getUser } from "../auth/user";
import { internal } from "../_generated/api";
import { mapGoogleEventToTimeblock } from "./helpers";
import { v } from "convex/values";

/**
 * Update visibility setting for a Google Calendar connection
 */
export const updateVisibility = mutation({
  args: {
    connectionId: v.id("googleCalendarConnections"),
    visibility: v.union(v.literal("public"), v.literal("hidden")),
  },
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

    await ctx.db.patch(args.connectionId, {
      visibility: args.visibility,
      updatedAt: Date.now(),
    });

    // Schedule permission update for all events from this connection
    await ctx.scheduler.runAfter(
      0,
      internal.googleCalendar.sync.updateEventPermissions,
      { connectionId: args.connectionId, visibility: args.visibility },
    );
  },
});

/**
 * Disconnect a Google Calendar account
 */
export const disconnectAccount = mutation({
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

    // Mark as disconnected and clear tokens
    await ctx.db.patch(args.connectionId, {
      syncStatus: "disconnected",
      isEnabled: false,
      accessToken: "", // Clear sensitive data
      refreshToken: "",
      updatedAt: Date.now(),
    });

    // Schedule webhook cleanup if exists
    if (connection.webhookChannelId) {
      await ctx.scheduler.runAfter(
        0,
        internal.googleCalendar.actions.stopWebhookChannel,
        { connectionId: args.connectionId },
      );
    }
  },
});

/**
 * Trigger manual sync for a connection
 */
export const triggerSync = mutation({
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

    if (connection.syncStatus === "disconnected") {
      throw new Error("Connection is disconnected");
    }

    // Schedule sync
    await ctx.scheduler.runAfter(
      0,
      internal.googleCalendar.sync.performIncrementalSync,
      { connectionId: args.connectionId },
    );
  },
});

// Internal mutations
// ----------------------------------------------------------------------------

/**
 * Store OAuth tokens after successful auth (internal only)
 */
export const storeConnection = internalMutation({
  args: {
    userId: v.string(),
    orgId: v.string(),
    googleAccountId: v.string(),
    googleEmail: v.string(),
    accessToken: v.string(),
    refreshToken: v.string(),
    tokenExpiresAt: v.number(),
    visibility: v.union(v.literal("public"), v.literal("hidden")),
  },
  handler: async (ctx, args) => {
    // Check if connection already exists for this Google account
    const existing = await ctx.db
      .query("googleCalendarConnections")
      .withIndex("by_google_account", (q) =>
        q.eq("googleAccountId", args.googleAccountId),
      )
      .first();

    if (existing) {
      // Update existing connection
      await ctx.db.patch(existing._id, {
        accessToken: args.accessToken,
        refreshToken: args.refreshToken,
        tokenExpiresAt: args.tokenExpiresAt,
        syncStatus: "active",
        isEnabled: true,
        lastErrorMessage: undefined,
        updatedAt: Date.now(),
      });

      // Schedule initial sync
      await ctx.scheduler.runAfter(
        0,
        internal.googleCalendar.sync.performFullSync,
        { connectionId: existing._id },
      );

      return existing._id;
    }

    // Create new connection
    const connectionId = await ctx.db.insert("googleCalendarConnections", {
      userId: args.userId,
      orgId: args.orgId,
      googleAccountId: args.googleAccountId,
      googleEmail: args.googleEmail,
      accessToken: args.accessToken,
      refreshToken: args.refreshToken,
      tokenExpiresAt: args.tokenExpiresAt,
      visibility: args.visibility,
      syncStatus: "active",
      isEnabled: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Schedule initial full sync
    await ctx.scheduler.runAfter(
      0,
      internal.googleCalendar.sync.performFullSync,
      { connectionId },
    );

    return connectionId;
  },
});

/**
 * Update tokens after refresh (internal only)
 */
export const updateTokens = internalMutation({
  args: {
    connectionId: v.id("googleCalendarConnections"),
    accessToken: v.string(),
    tokenExpiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.connectionId, {
      accessToken: args.accessToken,
      tokenExpiresAt: args.tokenExpiresAt,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Update sync state after sync completes (internal only)
 */
export const updateSyncState = internalMutation({
  args: {
    connectionId: v.id("googleCalendarConnections"),
    syncToken: v.optional(v.string()),
    lastSyncedAt: v.number(),
    syncStatus: v.union(
      v.literal("active"),
      v.literal("error"),
      v.literal("disconnected"),
    ),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.connectionId, {
      syncToken: args.syncToken,
      lastSyncedAt: args.lastSyncedAt,
      syncStatus: args.syncStatus,
      lastErrorMessage: args.errorMessage,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Update webhook info (internal only)
 */
export const updateWebhookInfo = internalMutation({
  args: {
    connectionId: v.id("googleCalendarConnections"),
    webhookChannelId: v.string(),
    webhookResourceId: v.string(),
    webhookExpiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.connectionId, {
      webhookChannelId: args.webhookChannelId,
      webhookResourceId: args.webhookResourceId,
      webhookExpiresAt: args.webhookExpiresAt,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Clear webhook info (internal only)
 */
export const clearWebhookInfo = internalMutation({
  args: { connectionId: v.id("googleCalendarConnections") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.connectionId, {
      webhookChannelId: undefined,
      webhookResourceId: undefined,
      webhookExpiresAt: undefined,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Upsert a timeblock from Google event (internal only)
 */
export const upsertGoogleEvent = internalMutation({
  args: {
    connectionId: v.id("googleCalendarConnections"),
    googleEvent: v.any(), // GoogleEventData
    visibility: v.union(v.literal("public"), v.literal("hidden")),
  },
  handler: async (ctx, args) => {
    const connection = await ctx.db.get(args.connectionId);
    if (!connection) throw new Error("Connection not found");

    const googleEvent = args.googleEvent as GoogleEventData;

    // Find existing timeblock by externalId
    const existing = await ctx.db
      .query("timeblocks")
      .withIndex("by_external_id", (q) => q.eq("externalId", googleEvent.id))
      .first();

    const timeblockData = mapGoogleEventToTimeblock(googleEvent, connection);

    let timeblockId: string;

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, timeblockData);
      timeblockId = existing._id;
    } else {
      // Create new
      timeblockId = await ctx.db.insert("timeblocks", timeblockData);

      // Grant manage permission to owner (same pattern as createTimeblock)
      await ctx.db.insert("permissions", {
        all: false,
        userId: connection.userId,
        orgId: connection.orgId,
        resourceType: "timeblocks",
        resourceId: timeblockId,
        permission: "manage",
        createdBy: connection.userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    // Handle permissions based on visibility
    if (args.visibility === "public") {
      // Check if "all" view permission exists
      const existingPerm = await ctx.db
        .query("permissions")
        .withIndex("by_org_and_type_and_resourceId", (q) =>
          q
            .eq("orgId", connection.orgId)
            .eq("resourceType", "timeblocks")
            .eq("resourceId", timeblockId),
        )
        .filter((q) => q.eq(q.field("all"), true))
        .first();

      if (!existingPerm) {
        await ctx.db.insert("permissions", {
          all: true,
          orgId: connection.orgId,
          resourceType: "timeblocks",
          resourceId: timeblockId,
          permission: "view",
          createdBy: connection.userId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }
    // For "hidden", no "all" permission is created

    return timeblockId;
  },
});

/**
 * Delete timeblock by Google event ID (internal only)
 */
export const deleteGoogleEvent = internalMutation({
  args: { externalId: v.string() },
  handler: async (ctx, args) => {
    const timeblock = await ctx.db
      .query("timeblocks")
      .withIndex("by_external_id", (q) => q.eq("externalId", args.externalId))
      .first();

    if (timeblock) {
      await deleteTimeblockWithRelations(ctx, timeblock._id);
    }
  },
});

/**
 * Delete a timeblock and its associated tasks and permissions
 */
async function deleteTimeblockWithRelations(
  ctx: MutationCtx,
  timeblockId: Id<"timeblocks">,
) {
  // Delete associated tasks
  const tasks = await ctx.db
    .query("tasks")
    .withIndex("by_timeblock", (q) => q.eq("timeblockId", timeblockId))
    .collect();

  for (const task of tasks) {
    await ctx.db.delete(task._id);
  }

  // Delete associated permissions
  const permissions = await ctx.db
    .query("permissions")
    .withIndex("by_resource", (q) =>
      q.eq("resourceType", "timeblocks").eq("resourceId", timeblockId),
    )
    .collect();

  for (const perm of permissions) {
    await ctx.db.delete(perm._id);
  }

  // Delete timeblock
  await ctx.db.delete(timeblockId);
}

/**
 * Cleanup orphaned timeblocks that no longer exist in Google Calendar (internal only)
 * Only deletes events from the specific Google connection being synced
 */
export const cleanupOrphanedTimeblocks = internalMutation({
  args: {
    connectionId: v.id("googleCalendarConnections"),
    validExternalIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Get timeblocks for this specific Google connection only
    const localTimeblocks = await ctx.db
      .query("timeblocks")
      .withIndex("by_google_connection", (q) =>
        q.eq("googleConnectionId", args.connectionId),
      )
      .collect();

    const validIds = new Set(args.validExternalIds);

    for (const tb of localTimeblocks) {
      if (tb.externalId && !validIds.has(tb.externalId)) {
        await deleteTimeblockWithRelations(ctx, tb._id);
      }
    }
  },
});
