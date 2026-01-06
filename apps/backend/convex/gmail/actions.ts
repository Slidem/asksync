/* eslint-disable import/order */
import { ActionCtx, internalAction } from "../_generated/server";
import {
  GmailHistoryResponse,
  GmailMessage,
  GmailMessagesListResponse,
  GmailProfile,
} from "./types";
import { refreshAccessToken, tokenNeedsRefresh } from "./helpers";

import { Id } from "../_generated/dataModel";
import { internal } from "../_generated/api";
import { v } from "convex/values";

const GMAIL_API = "https://gmail.googleapis.com/gmail/v1";

type ActionContext = Pick<ActionCtx, "runQuery" | "runMutation">;

/**
 * Get a valid access token, refreshing if needed
 */
export async function getValidAccessToken(
  ctx: ActionContext,
  connectionId: Id<"gmailConnections">,
): Promise<string> {
  const connection = await ctx.runQuery(
    internal.gmail.queries.getConnectionInternal,
    { connectionId },
  );

  if (!connection) throw new Error("Connection not found");

  if (tokenNeedsRefresh(connection.tokenExpiresAt)) {
    const { accessToken, expiresAt } = await refreshAccessToken(
      connection.refreshToken,
    );

    await ctx.runMutation(internal.gmail.mutations.updateTokens, {
      connectionId,
      accessToken,
      tokenExpiresAt: expiresAt,
    });

    return accessToken;
  }

  return connection.accessToken;
}

/**
 * Get Gmail profile (for historyId on initial sync)
 */
export async function getGmailProfileImpl(
  ctx: ActionContext,
  connectionId: Id<"gmailConnections">,
): Promise<GmailProfile> {
  const accessToken = await getValidAccessToken(ctx, connectionId);

  const response = await fetch(`${GMAIL_API}/users/me/profile`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gmail API error: ${error}`);
  }

  return (await response.json()) as GmailProfile;
}

/**
 * List recent messages from inbox
 */
export async function listMessagesImpl(
  ctx: ActionContext,
  connectionId: Id<"gmailConnections">,
  options?: {
    maxResults?: number;
    pageToken?: string;
    query?: string;
  },
): Promise<GmailMessagesListResponse> {
  const accessToken = await getValidAccessToken(ctx, connectionId);

  const params = new URLSearchParams({
    maxResults: String(options?.maxResults || 50),
    labelIds: "INBOX",
  });

  if (options?.pageToken) {
    params.set("pageToken", options.pageToken);
  }

  if (options?.query) {
    params.set("q", options.query);
  }

  const response = await fetch(`${GMAIL_API}/users/me/messages?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gmail API error: ${error}`);
  }

  return (await response.json()) as GmailMessagesListResponse;
}

/**
 * Get message history since historyId
 */
export async function getHistoryImpl(
  ctx: ActionContext,
  connectionId: Id<"gmailConnections">,
  startHistoryId: string,
): Promise<GmailHistoryResponse> {
  const accessToken = await getValidAccessToken(ctx, connectionId);

  const params = new URLSearchParams({
    startHistoryId,
    historyTypes: "messageAdded",
    labelId: "INBOX",
  });

  const response = await fetch(`${GMAIL_API}/users/me/history?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gmail API error: ${error}`);
  }

  return (await response.json()) as GmailHistoryResponse;
}

/**
 * Get full message by ID
 */
export async function getMessageImpl(
  ctx: ActionContext,
  connectionId: Id<"gmailConnections">,
  messageId: string,
): Promise<GmailMessage> {
  const accessToken = await getValidAccessToken(ctx, connectionId);

  const response = await fetch(
    `${GMAIL_API}/users/me/messages/${messageId}?format=full`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gmail API error: ${error}`);
  }

  return (await response.json()) as GmailMessage;
}

/**
 * Refresh tokens for a connection
 */
export async function refreshTokensImpl(
  ctx: ActionContext,
  connectionId: Id<"gmailConnections">,
): Promise<void> {
  const connection = await ctx.runQuery(
    internal.gmail.queries.getConnectionInternal,
    { connectionId },
  );

  if (!connection) throw new Error("Connection not found");

  try {
    const { accessToken, expiresAt } = await refreshAccessToken(
      connection.refreshToken,
    );

    await ctx.runMutation(internal.gmail.mutations.updateTokens, {
      connectionId,
      accessToken,
      tokenExpiresAt: expiresAt,
    });
  } catch (error) {
    await ctx.runMutation(internal.gmail.mutations.updateSyncState, {
      connectionId,
      lastSyncedAt: Date.now(),
      syncStatus: "error",
      errorMessage:
        error instanceof Error ? error.message : "Token refresh failed",
    });
  }
}

// Internal actions (entry points)

export const getGmailProfile = internalAction({
  args: { connectionId: v.id("gmailConnections") },
  handler: async (ctx, args): Promise<GmailProfile> => {
    return getGmailProfileImpl(ctx, args.connectionId);
  },
});

export const listMessages = internalAction({
  args: {
    connectionId: v.id("gmailConnections"),
    maxResults: v.optional(v.number()),
    pageToken: v.optional(v.string()),
    query: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<GmailMessagesListResponse> => {
    return listMessagesImpl(ctx, args.connectionId, {
      maxResults: args.maxResults,
      pageToken: args.pageToken,
      query: args.query,
    });
  },
});

export const getMessage = internalAction({
  args: {
    connectionId: v.id("gmailConnections"),
    messageId: v.string(),
  },
  handler: async (ctx, args): Promise<GmailMessage> => {
    return getMessageImpl(ctx, args.connectionId, args.messageId);
  },
});

export const getHistory = internalAction({
  args: {
    connectionId: v.id("gmailConnections"),
    startHistoryId: v.string(),
  },
  handler: async (ctx, args): Promise<GmailHistoryResponse> => {
    return getHistoryImpl(ctx, args.connectionId, args.startHistoryId);
  },
});
