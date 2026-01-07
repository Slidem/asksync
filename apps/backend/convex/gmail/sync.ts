/* eslint-disable import/order */
import { ActionCtx, internalAction } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";
import {
  getGmailProfileImpl,
  getHistoryImpl,
  getMessageImpl,
  listMessagesImpl,
  refreshTokensImpl,
} from "./actions";
import { matchesRule, mergeTagIds, parseGmailMessage } from "./helpers";

import { internal } from "../_generated/api";
import { v } from "convex/values";

/**
 * Process a single message against all rules
 */
async function processMessage(
  ctx: ActionCtx,
  connection: Doc<"gmailConnections">,
  messageId: string,
  rules: Doc<"emailConversionRules">[],
): Promise<boolean> {
  // Check if already processed
  const existing = await ctx.runQuery(
    internal.gmail.queries.getAttentionItemByMessageId,
    { gmailMessageId: messageId },
  );

  if (existing) return false;

  // Fetch full message
  const message = await getMessageImpl(ctx, connection._id, messageId);
  const parsed = parseGmailMessage(message);

  // Find matching rules
  const matchingRules = rules.filter((rule) => matchesRule(parsed, rule));

  if (matchingRules.length === 0) return false;

  // Merge tags from all matching rules
  const tagIds = mergeTagIds(matchingRules);

  // Create attention item
  await ctx.runMutation(internal.gmail.mutations.createAttentionItem, {
    userId: connection.userId,
    orgId: connection.orgId,
    gmailConnectionId: connection._id,
    matchedRuleIds: matchingRules.map((r) => r._id),
    gmailMessageId: message.id,
    gmailThreadId: message.threadId,
    senderEmail: parsed.sender,
    senderName: parsed.senderName,
    subject: parsed.subject,
    snippet: message.snippet,
    htmlBody: parsed.htmlBody,
    receivedAt: parsed.receivedAt,
    tagIds,
  });

  return true;
}

/**
 * Perform sync for a single connection
 */
async function syncConnection(
  ctx: ActionCtx,
  connectionId: Id<"gmailConnections">,
): Promise<{ processed: number; created: number }> {
  const connection = await ctx.runQuery(
    internal.gmail.queries.getConnectionInternal,
    { connectionId },
  );

  if (!connection || connection.syncStatus === "disconnected") {
    return { processed: 0, created: 0 };
  }

  // Get active rules for this connection
  const rules = await ctx.runQuery(
    internal.gmail.queries.getRulesForConnection,
    { connectionId },
  );

  if (rules.length === 0) {
    // No rules = no processing needed, just update sync time
    await ctx.runMutation(internal.gmail.mutations.updateSyncState, {
      connectionId,
      lastSyncedAt: Date.now(),
      syncStatus: "active",
    });
    return { processed: 0, created: 0 };
  }

  try {
    let processed = 0;
    let created = 0;

    if (connection.lastHistoryId) {
      // Incremental sync using history
      try {
        const history = await getHistoryImpl(
          ctx,
          connectionId,
          connection.lastHistoryId,
        );

        // Process new messages
        for (const record of history.history || []) {
          for (const added of record.messagesAdded || []) {
            processed++;
            const wasCreated = await processMessage(
              ctx,
              connection,
              added.message.id,
              rules,
            );
            if (wasCreated) created++;
          }
        }

        // Update history ID
        await ctx.runMutation(internal.gmail.mutations.updateSyncState, {
          connectionId,
          lastHistoryId: history.historyId,
          lastSyncedAt: Date.now(),
          syncStatus: "active",
        });
      } catch (error) {
        // History ID expired (404) - fall back to full sync
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        if (
          errorMessage.includes("404") ||
          errorMessage.includes("Not Found")
        ) {
          return await performFullSyncForConnection(ctx, connection, rules);
        }
        throw error;
      }
    } else {
      // Initial sync - get recent messages and current historyId
      return await performFullSyncForConnection(ctx, connection, rules);
    }

    return { processed, created };
  } catch (error) {
    await ctx.runMutation(internal.gmail.mutations.updateSyncState, {
      connectionId,
      lastSyncedAt: Date.now(),
      syncStatus: "error",
      errorMessage: error instanceof Error ? error.message : "Sync failed",
    });
    throw error;
  }
}

/**
 * Full sync for a connection - gets recent messages and establishes historyId
 */
async function performFullSyncForConnection(
  ctx: ActionCtx,
  connection: Doc<"gmailConnections">,
  rules: Doc<"emailConversionRules">[],
): Promise<{ processed: number; created: number }> {
  // Get current historyId from profile
  const profile = await getGmailProfileImpl(ctx, connection._id);

  // Get recent inbox messages (last 7 days)
  const messages = await listMessagesImpl(ctx, connection._id, {
    maxResults: 100,
    query: "newer_than:7d",
  });

  let processed = 0;
  let created = 0;

  // Process each message
  for (const msg of messages.messages || []) {
    processed++;
    const wasCreated = await processMessage(ctx, connection, msg.id, rules);
    if (wasCreated) created++;
  }

  // Save historyId for future incremental syncs
  await ctx.runMutation(internal.gmail.mutations.updateSyncState, {
    connectionId: connection._id,
    lastHistoryId: profile.historyId,
    lastSyncedAt: Date.now(),
    syncStatus: "active",
  });

  return { processed, created };
}

/**
 * Sync all active Gmail connections (called by cron)
 */
export const performSync = internalAction({
  args: {},
  handler: async (ctx): Promise<void> => {
    const connections = await ctx.runQuery(
      internal.gmail.queries.getActiveConnections,
      {},
    );

    for (const connection of connections) {
      try {
        await syncConnection(ctx, connection._id);
      } catch (error) {
        console.error(`Gmail sync failed for ${connection._id}:`, error);
      }
    }
  },
});

/**
 * Sync a single connection (can be called manually)
 */
export const syncSingleConnection = internalAction({
  args: { connectionId: v.id("gmailConnections") },
  handler: async (
    ctx,
    args,
  ): Promise<{ processed: number; created: number }> => {
    return await syncConnection(ctx, args.connectionId);
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
      internal.gmail.queries.getConnectionsWithExpiringTokens,
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
