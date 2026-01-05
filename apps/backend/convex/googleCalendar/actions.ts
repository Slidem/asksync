/* eslint-disable import/order */
import { ActionCtx, internalAction } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { refreshAccessToken, tokenNeedsRefresh } from "./helpers";

import { GoogleEventsListResponse } from "./types";
import { internal } from "../_generated/api";
import { v } from "convex/values";

const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";

type ActionContext = Pick<ActionCtx, "runQuery" | "runMutation">;

// ============================================================================
// Reusable async functions (can be called directly from other actions)
// ============================================================================

/**
 * Get a valid access token, refreshing if needed
 */
export async function getValidAccessToken(
  ctx: ActionContext,
  connectionId: Id<"googleCalendarConnections">,
): Promise<string> {
  const connection = await ctx.runQuery(
    internal.googleCalendar.queries.getConnectionInternal,
    { connectionId },
  );

  if (!connection) throw new Error("Connection not found");

  if (tokenNeedsRefresh(connection.tokenExpiresAt)) {
    const { accessToken, expiresAt } = await refreshAccessToken(
      connection.refreshToken,
    );

    await ctx.runMutation(internal.googleCalendar.mutations.updateTokens, {
      connectionId,
      accessToken,
      tokenExpiresAt: expiresAt,
    });

    return accessToken;
  }

  return connection.accessToken;
}

/**
 * Fetch events from Google Calendar (reusable function)
 */
export async function fetchGoogleEventsImpl(
  ctx: ActionContext,
  args: {
    connectionId: Id<"googleCalendarConnections">;
    syncToken?: string;
    pageToken?: string;
  },
): Promise<GoogleEventsListResponse> {
  const accessToken = await getValidAccessToken(ctx, args.connectionId);

  const params = new URLSearchParams({
    maxResults: "250",
    singleEvents: "true",
    orderBy: "startTime",
  });

  if (args.syncToken) {
    params.set("syncToken", args.syncToken);
  } else {
    // Full sync: get events from 30 days ago to 365 days ahead
    const timeMin = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const timeMax = new Date(
      Date.now() + 365 * 24 * 60 * 60 * 1000,
    ).toISOString();
    params.set("timeMin", timeMin);
    params.set("timeMax", timeMax);
  }

  if (args.pageToken) {
    params.set("pageToken", args.pageToken);
  }

  const response = await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/primary/events?${params}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google API error: ${error}`);
  }

  return await response.json();
}

/**
 * Setup webhook for push notifications (reusable function)
 */
export async function setupWebhookImpl(
  ctx: ActionContext,
  connectionId: Id<"googleCalendarConnections">,
): Promise<string> {
  const accessToken = await getValidAccessToken(ctx, connectionId);

  const channelId = crypto.randomUUID();
  const expiration = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

  const webhookUrl = `${process.env.CONVEX_SITE_URL}/google-calendar/webhook`;

  const response = await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/primary/events/watch`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: channelId,
        type: "web_hook",
        address: webhookUrl,
        expiration: expiration.toString(),
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to setup webhook: ${error}`);
  }

  const result = await response.json();

  await ctx.runMutation(internal.googleCalendar.mutations.updateWebhookInfo, {
    connectionId,
    webhookChannelId: channelId,
    webhookResourceId: result.resourceId,
    webhookExpiresAt: expiration,
  });

  return channelId;
}

/**
 * Stop webhook channel (reusable function)
 */
export async function stopWebhookChannelImpl(
  ctx: ActionContext,
  connectionId: Id<"googleCalendarConnections">,
): Promise<void> {
  const connection = await ctx.runQuery(
    internal.googleCalendar.queries.getConnectionInternal,
    { connectionId },
  );

  if (!connection?.webhookChannelId || !connection?.webhookResourceId) {
    return;
  }

  try {
    const accessToken = await getValidAccessToken(ctx, connectionId);

    await fetch(`${GOOGLE_CALENDAR_API}/channels/stop`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: connection.webhookChannelId,
        resourceId: connection.webhookResourceId,
      }),
    });
  } catch {
    // Ignore errors - webhook might already be expired
  }

  await ctx.runMutation(internal.googleCalendar.mutations.clearWebhookInfo, {
    connectionId,
  });
}

/**
 * Refresh tokens for a connection (reusable function)
 */
export async function refreshTokensImpl(
  ctx: ActionContext,
  connectionId: Id<"googleCalendarConnections">,
): Promise<void> {
  const connection = await ctx.runQuery(
    internal.googleCalendar.queries.getConnectionInternal,
    { connectionId },
  );

  if (!connection) throw new Error("Connection not found");

  try {
    const { accessToken, expiresAt } = await refreshAccessToken(
      connection.refreshToken,
    );

    await ctx.runMutation(internal.googleCalendar.mutations.updateTokens, {
      connectionId,
      accessToken,
      tokenExpiresAt: expiresAt,
    });
  } catch (error) {
    // Mark connection as error
    await ctx.runMutation(internal.googleCalendar.mutations.updateSyncState, {
      connectionId,
      lastSyncedAt: Date.now(),
      syncStatus: "error",
      errorMessage:
        error instanceof Error ? error.message : "Token refresh failed",
    });
  }
}

// ============================================================================
// Internal actions (entry points for scheduling, crons, external calls)
// ============================================================================
export const fetchGoogleEvents = internalAction({
  args: {
    connectionId: v.id("googleCalendarConnections"),
    syncToken: v.optional(v.string()),
    pageToken: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<GoogleEventsListResponse> => {
    return fetchGoogleEventsImpl(ctx, args);
  },
});

export const setupWebhook = internalAction({
  args: { connectionId: v.id("googleCalendarConnections") },
  handler: async (ctx, args): Promise<string> => {
    return setupWebhookImpl(ctx, args.connectionId);
  },
});

export const stopWebhookChannel = internalAction({
  args: { connectionId: v.id("googleCalendarConnections") },
  handler: async (ctx, args): Promise<void> => {
    return stopWebhookChannelImpl(ctx, args.connectionId);
  },
});
