/* eslint-disable import/order */
import { internalMutation, mutation } from "../_generated/server";

import { calculateExpectedAnswerTime } from "../common/expectedTime";
import { getUser } from "../auth/user";
import { internal } from "../_generated/api";
import { v } from "convex/values";

/**
 * Disconnect a Gmail account
 */
export const disconnectAccount = mutation({
  args: { connectionId: v.id("gmailConnections") },
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
      accessToken: "",
      refreshToken: "",
      updatedAt: Date.now(),
    });

    // Delete associated rules
    const rules = await ctx.db
      .query("emailConversionRules")
      .withIndex("by_gmail_connection", (q) =>
        q.eq("gmailConnectionId", args.connectionId),
      )
      .collect();

    for (const rule of rules) {
      await ctx.db.delete(rule._id);
    }

    // Delete associated attention items
    const items = await ctx.db
      .query("emailAttentionItems")
      .withIndex("by_gmail_connection", (q) =>
        q.eq("gmailConnectionId", args.connectionId),
      )
      .collect();

    for (const item of items) {
      await ctx.db.delete(item._id);
    }
  },
});

/**
 * Trigger a manual sync for a Gmail connection
 */
export const triggerSync = mutation({
  args: { connectionId: v.id("gmailConnections") },
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

    await ctx.scheduler.runAfter(0, internal.gmail.sync.syncSingleConnection, {
      connectionId: args.connectionId,
    });
  },
});

/**
 * Create a new conversion rule
 */
export const createRule = mutation({
  args: {
    connectionId: v.id("gmailConnections"),
    name: v.string(),
    senderPattern: v.optional(v.string()),
    subjectPattern: v.optional(v.string()),
    contentPattern: v.optional(v.string()),
    autoTagIds: v.array(v.string()),
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

    // Validate at least one pattern is provided
    if (!args.senderPattern && !args.subjectPattern && !args.contentPattern) {
      throw new Error(
        "At least one pattern (sender, subject, or content) is required",
      );
    }

    // Validate regex patterns
    const patterns = [
      args.senderPattern,
      args.subjectPattern,
      args.contentPattern,
    ];
    for (const pattern of patterns) {
      if (pattern) {
        try {
          new RegExp(pattern);
        } catch {
          throw new Error(`Invalid regex pattern: ${pattern}`);
        }
      }
    }

    // Get max priority for ordering
    const existingRules = await ctx.db
      .query("emailConversionRules")
      .withIndex("by_gmail_connection", (q) =>
        q.eq("gmailConnectionId", args.connectionId),
      )
      .collect();

    const maxPriority = existingRules.reduce(
      (max, r) => Math.max(max, r.priority),
      0,
    );

    const ruleId = await ctx.db.insert("emailConversionRules", {
      userId,
      orgId,
      gmailConnectionId: args.connectionId,
      name: args.name,
      senderPattern: args.senderPattern,
      subjectPattern: args.subjectPattern,
      contentPattern: args.contentPattern,
      autoTagIds: args.autoTagIds,
      isEnabled: true,
      priority: maxPriority + 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return ruleId;
  },
});

/**
 * Update an existing conversion rule
 */
export const updateRule = mutation({
  args: {
    ruleId: v.id("emailConversionRules"),
    name: v.optional(v.string()),
    senderPattern: v.optional(v.string()),
    subjectPattern: v.optional(v.string()),
    contentPattern: v.optional(v.string()),
    autoTagIds: v.optional(v.array(v.string())),
    isEnabled: v.optional(v.boolean()),
    priority: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id: userId, orgId } = await getUser(ctx);
    const rule = await ctx.db.get(args.ruleId);

    if (!rule || rule.userId !== userId || rule.orgId !== orgId) {
      throw new Error("Rule not found");
    }

    // Validate regex patterns if provided
    const patterns = [
      args.senderPattern,
      args.subjectPattern,
      args.contentPattern,
    ];
    for (const pattern of patterns) {
      if (pattern !== undefined && pattern !== null && pattern !== "") {
        try {
          new RegExp(pattern);
        } catch {
          throw new Error(`Invalid regex pattern: ${pattern}`);
        }
      }
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.senderPattern !== undefined)
      updates.senderPattern = args.senderPattern || undefined;
    if (args.subjectPattern !== undefined)
      updates.subjectPattern = args.subjectPattern || undefined;
    if (args.contentPattern !== undefined)
      updates.contentPattern = args.contentPattern || undefined;
    if (args.autoTagIds !== undefined) updates.autoTagIds = args.autoTagIds;
    if (args.isEnabled !== undefined) updates.isEnabled = args.isEnabled;
    if (args.priority !== undefined) updates.priority = args.priority;

    await ctx.db.patch(args.ruleId, updates);
  },
});

/**
 * Delete a conversion rule
 */
export const deleteRule = mutation({
  args: { ruleId: v.id("emailConversionRules") },
  handler: async (ctx, args) => {
    const { id: userId, orgId } = await getUser(ctx);
    const rule = await ctx.db.get(args.ruleId);

    if (!rule || rule.userId !== userId || rule.orgId !== orgId) {
      throw new Error("Rule not found");
    }

    await ctx.db.delete(args.ruleId);
  },
});

/**
 * Resolve an attention item
 */
export const resolveItem = mutation({
  args: { itemId: v.id("emailAttentionItems") },
  handler: async (ctx, args) => {
    const { id: userId, orgId } = await getUser(ctx);
    const item = await ctx.db.get(args.itemId);

    if (!item || item.userId !== userId || item.orgId !== orgId) {
      throw new Error("Item not found");
    }

    await ctx.db.patch(args.itemId, {
      status: "resolved",
      resolvedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/**
 * Unresolve an attention item (mark as pending again)
 */
export const unresolveItem = mutation({
  args: { itemId: v.id("emailAttentionItems") },
  handler: async (ctx, args) => {
    const { id: userId, orgId } = await getUser(ctx);
    const item = await ctx.db.get(args.itemId);

    if (!item || item.userId !== userId || item.orgId !== orgId) {
      throw new Error("Item not found");
    }

    await ctx.db.patch(args.itemId, {
      status: "pending",
      resolvedAt: undefined,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Delete an attention item
 */
export const deleteItem = mutation({
  args: { itemId: v.id("emailAttentionItems") },
  handler: async (ctx, args) => {
    const { id: userId, orgId } = await getUser(ctx);
    const item = await ctx.db.get(args.itemId);

    if (!item || item.userId !== userId || item.orgId !== orgId) {
      throw new Error("Item not found");
    }

    await ctx.db.delete(args.itemId);
  },
});

/**
 * Mark attention items as notified
 */
export const markItemsAsNotified = mutation({
  args: { itemIds: v.array(v.id("emailAttentionItems")) },
  handler: async (ctx, args) => {
    const { id: userId, orgId } = await getUser(ctx);
    const now = Date.now();

    for (const itemId of args.itemIds) {
      const item = await ctx.db.get(itemId);
      if (item && item.userId === userId && item.orgId === orgId) {
        await ctx.db.patch(itemId, { notifiedAt: now });
      }
    }

    return true;
  },
});

// Internal mutations

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
  },
  handler: async (ctx, args) => {
    // Check if connection already exists for this Google account
    const existing = await ctx.db
      .query("gmailConnections")
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

      return existing._id;
    }

    // Create new connection
    const connectionId = await ctx.db.insert("gmailConnections", {
      userId: args.userId,
      orgId: args.orgId,
      googleAccountId: args.googleAccountId,
      googleEmail: args.googleEmail,
      accessToken: args.accessToken,
      refreshToken: args.refreshToken,
      tokenExpiresAt: args.tokenExpiresAt,
      syncStatus: "active",
      isEnabled: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return connectionId;
  },
});

/**
 * Update tokens after refresh (internal only)
 */
export const updateTokens = internalMutation({
  args: {
    connectionId: v.id("gmailConnections"),
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
    connectionId: v.id("gmailConnections"),
    lastHistoryId: v.optional(v.string()),
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
      lastHistoryId: args.lastHistoryId,
      lastSyncedAt: args.lastSyncedAt,
      syncStatus: args.syncStatus,
      lastErrorMessage: args.errorMessage,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Create attention item from email (internal only)
 */
export const createAttentionItem = internalMutation({
  args: {
    userId: v.string(),
    orgId: v.string(),
    gmailConnectionId: v.id("gmailConnections"),
    matchedRuleIds: v.array(v.id("emailConversionRules")),
    gmailMessageId: v.string(),
    gmailThreadId: v.string(),
    senderEmail: v.string(),
    senderName: v.optional(v.string()),
    subject: v.string(),
    snippet: v.string(),
    htmlBody: v.optional(v.string()),
    receivedAt: v.number(),
    tagIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if already exists
    const existing = await ctx.db
      .query("emailAttentionItems")
      .withIndex("by_gmail_message", (q) =>
        q.eq("gmailMessageId", args.gmailMessageId),
      )
      .first();

    if (existing) {
      return existing._id;
    }

    // Calculate expected answer time using shared logic
    const now = Date.now();
    const expectedAnswerTime = await calculateExpectedAnswerTime(
      ctx,
      args.orgId,
      args.tagIds,
      [args.userId], // user as single "assignee" for emails
      now,
    );
    const isOverdue = expectedAnswerTime < now;

    const itemId = await ctx.db.insert("emailAttentionItems", {
      userId: args.userId,
      orgId: args.orgId,
      gmailConnectionId: args.gmailConnectionId,
      matchedRuleIds: args.matchedRuleIds,
      gmailMessageId: args.gmailMessageId,
      gmailThreadId: args.gmailThreadId,
      senderEmail: args.senderEmail,
      senderName: args.senderName,
      subject: args.subject,
      snippet: args.snippet,
      htmlBody: args.htmlBody,
      receivedAt: args.receivedAt,
      status: "pending",
      tagIds: args.tagIds,
      expectedAnswerTime,
      isOverdue,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update rule match counts
    for (const ruleId of args.matchedRuleIds) {
      const rule = await ctx.db.get(ruleId);
      if (rule) {
        await ctx.db.patch(ruleId, {
          matchCount: (rule.matchCount || 0) + 1,
          lastMatchedAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }

    return itemId;
  },
});
