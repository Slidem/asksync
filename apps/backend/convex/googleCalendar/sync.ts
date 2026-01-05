import {
  ActionCtx,
  internalAction,
  internalMutation,
} from "../_generated/server";
import { GoogleCalendarVisibility, GoogleEventData } from "./types";
/* eslint-disable import/order */
import {
  fetchGoogleEventsImpl,
  refreshTokensImpl,
  setupWebhookImpl,
  stopWebhookChannelImpl,
} from "./actions";

import { Id } from "../_generated/dataModel";
import { internal } from "../_generated/api";
import { v } from "convex/values";

/**
 * Process a single Google event (upsert or delete based on status)
 */
async function processGoogleEvent(
  ctx: ActionCtx,
  connectionId: Id<"googleCalendarConnections">,
  event: GoogleEventData,
  visibility: GoogleCalendarVisibility,
): Promise<void> {
  if (event.status === "cancelled") {
    await ctx.runMutation(internal.googleCalendar.mutations.deleteGoogleEvent, {
      externalId: event.id,
    });
  } else {
    await ctx.runMutation(internal.googleCalendar.mutations.upsertGoogleEvent, {
      connectionId,
      googleEvent: event,
      visibility,
    });
  }
}

/**
 * Perform full sync from Google Calendar
 */
export const performFullSync = internalAction({
  args: { connectionId: v.id("googleCalendarConnections") },
  handler: async (ctx, args): Promise<void> => {
    const connection = await ctx.runQuery(
      internal.googleCalendar.queries.getConnectionInternal,
      { connectionId: args.connectionId },
    );

    if (!connection) throw new Error("Connection not found");

    try {
      let pageToken: string | undefined;
      let syncToken: string | undefined;
      const allGoogleEventIds: string[] = [];

      do {
        const result = await fetchGoogleEventsImpl(ctx, {
          connectionId: args.connectionId,
          pageToken,
        });

        for (const event of result.items || []) {
          allGoogleEventIds.push(event.id);
          await processGoogleEvent(
            ctx,
            args.connectionId,
            event,
            connection.visibility,
          );
        }

        pageToken = result.nextPageToken;
        syncToken = result.nextSyncToken;
      } while (pageToken);

      // Cleanup orphaned timeblocks not in the Google response
      await ctx.runMutation(
        internal.googleCalendar.mutations.cleanupOrphanedTimeblocks,
        {
          connectionId: args.connectionId,
          validExternalIds: allGoogleEventIds,
        },
      );

      // Save sync token for incremental syncs
      await ctx.runMutation(internal.googleCalendar.mutations.updateSyncState, {
        connectionId: args.connectionId,
        syncToken,
        lastSyncedAt: Date.now(),
        syncStatus: "active",
      });

      // Setup webhook for push notifications
      await setupWebhookImpl(ctx, args.connectionId);
    } catch (error) {
      await ctx.runMutation(internal.googleCalendar.mutations.updateSyncState, {
        connectionId: args.connectionId,
        lastSyncedAt: Date.now(),
        syncStatus: "error",
        errorMessage:
          error instanceof Error ? error.message : "Full sync failed",
      });
      throw error;
    }
  },
});

/**
 * Perform incremental sync using sync token
 */
export const performIncrementalSync = internalAction({
  args: { connectionId: v.id("googleCalendarConnections") },
  handler: async (ctx, args): Promise<void> => {
    const connection = await ctx.runQuery(
      internal.googleCalendar.queries.getConnectionInternal,
      { connectionId: args.connectionId },
    );

    if (!connection) throw new Error("Connection not found");

    // No sync token - do full sync
    if (!connection.syncToken) {
      await ctx.runAction(internal.googleCalendar.sync.performFullSync, {
        connectionId: args.connectionId,
      });
      return;
    }

    try {
      const result = await fetchGoogleEventsImpl(ctx, {
        connectionId: args.connectionId,
        syncToken: connection.syncToken,
      });

      for (const event of result.items || []) {
        await processGoogleEvent(
          ctx,
          args.connectionId,
          event,
          connection.visibility,
        );
      }

      // Update sync token
      await ctx.runMutation(internal.googleCalendar.mutations.updateSyncState, {
        connectionId: args.connectionId,
        syncToken: result.nextSyncToken,
        lastSyncedAt: Date.now(),
        syncStatus: "active",
      });
    } catch (error) {
      // Sync token invalid (410 Gone) - do full sync
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("410") || errorMessage.includes("Gone")) {
        await ctx.runAction(internal.googleCalendar.sync.performFullSync, {
          connectionId: args.connectionId,
        });
        return;
      }

      await ctx.runMutation(internal.googleCalendar.mutations.updateSyncState, {
        connectionId: args.connectionId,
        lastSyncedAt: Date.now(),
        syncStatus: "error",
        errorMessage,
      });
      throw error;
    }
  },
});

/**
 * Update permissions for all events when visibility changes
 */
export const updateEventPermissions = internalMutation({
  args: {
    connectionId: v.id("googleCalendarConnections"),
    visibility: v.union(v.literal("public"), v.literal("hidden")),
  },
  handler: async (ctx, args) => {
    const connection = await ctx.db.get(args.connectionId);
    if (!connection) return;

    // Find all timeblocks from this specific Google connection
    const timeblocks = await ctx.db
      .query("timeblocks")
      .withIndex("by_google_connection", (q) =>
        q.eq("googleConnectionId", args.connectionId),
      )
      .collect();

    for (const timeblock of timeblocks) {
      // Get existing "all" permission
      const allPerm = await ctx.db
        .query("permissions")
        .withIndex("by_org_and_type_and_resourceId", (q) =>
          q
            .eq("orgId", connection.orgId)
            .eq("resourceType", "timeblocks")
            .eq("resourceId", timeblock._id),
        )
        .filter((q) => q.eq(q.field("all"), true))
        .first();

      if (args.visibility === "public" && !allPerm) {
        // Add public view permission
        await ctx.db.insert("permissions", {
          all: true,
          orgId: connection.orgId,
          resourceType: "timeblocks",
          resourceId: timeblock._id,
          permission: "view",
          createdBy: connection.userId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      } else if (args.visibility === "hidden" && allPerm) {
        // Remove public view permission
        await ctx.db.delete(allPerm._id);
      }
    }
  },
});

/**
 * Refresh expiring webhooks (called by cron)
 */
export const refreshExpiringWebhooks = internalAction({
  args: {},
  handler: async (ctx): Promise<void> => {
    // Webhooks expiring within 1 day
    const threshold = Date.now() + 24 * 60 * 60 * 1000;

    const connections = await ctx.runQuery(
      internal.googleCalendar.queries.getConnectionsWithExpiringWebhooks,
      { expirationThreshold: threshold },
    );

    for (const connection of connections) {
      try {
        await stopWebhookChannelImpl(ctx, connection._id);
        await setupWebhookImpl(ctx, connection._id);
      } catch (error) {
        console.error(
          `Failed to refresh webhook for ${connection._id}:`,
          error,
        );
      }
    }
  },
});

/**
 * Refresh expiring tokens (called by cron)
 */
export const refreshExpiringTokens = internalAction({
  args: {},
  handler: async (ctx): Promise<void> => {
    const oneHourFromNow = Date.now() + 1000 * 60 * 60;

    const connections = await ctx.runQuery(
      internal.googleCalendar.queries.getConnectionsWithExpiringTokens,
      { expirationThreshold: oneHourFromNow },
    );

    for (const connection of connections) {
      try {
        await refreshTokensImpl(ctx, connection._id);
      } catch (error) {
        console.error(`Failed to refresh tokens for ${connection._id}:`, error);
      }
    }
  },
});

/**
 * Backup full sync for all active connections (called by cron)
 */
export const backupFullSync = internalAction({
  args: {},
  handler: async (ctx): Promise<void> => {
    const connections = await ctx.runQuery(
      internal.googleCalendar.queries.getActiveConnections,
      {},
    );

    for (const connection of connections) {
      try {
        await ctx.runAction(internal.googleCalendar.sync.performFullSync, {
          connectionId: connection._id,
        });
      } catch (error) {
        console.error(`Backup sync failed for ${connection._id}:`, error);
      }
    }
  },
});
