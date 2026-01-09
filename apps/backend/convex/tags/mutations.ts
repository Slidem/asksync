/* eslint-disable import/order */
import { Doc } from "../_generated/dataModel";
import { getUser } from "../auth/user";
import { hasPermission } from "../permissions/common";
import { internal } from "../_generated/api";
import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createTag = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    color: v.string(),
    answerMode: v.union(v.literal("on-demand"), v.literal("scheduled")),
    responseTimeMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { orgId, id: userId } = await getUser(ctx);

    // Validate answer mode and response time
    if (args.answerMode === "on-demand" && !args.responseTimeMinutes) {
      throw new Error("Response time is required for on-demand tags");
    }

    const existingTag = await ctx.db
      .query("tags")
      .withIndex("by_org_and_name", (q) =>
        q.eq("orgId", orgId).eq("name", args.name),
      )
      .first();

    if (existingTag) {
      throw new Error("A tag with this name already exists");
    }

    const tagId = await ctx.db.insert("tags", {
      orgId,
      name: args.name,
      description: args.description,
      color: args.color,
      answerMode: args.answerMode,
      responseTimeMinutes: args.responseTimeMinutes,
      createdBy: userId,
      updatedAt: Date.now(),
    });

    // Grant manage permission to creator
    await ctx.db.insert("permissions", {
      userId,
      orgId,
      resourceType: "tags",
      resourceId: tagId,
      permission: "manage",
      createdBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return tagId;
  },
});

export const updateTag = mutation({
  args: {
    id: v.id("tags"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    answerMode: v.optional(
      v.union(v.literal("on-demand"), v.literal("scheduled")),
    ),
    responseTimeMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get the user identity
    const { orgId, id: userId } = await getUser(ctx);

    const existingTag = await ctx.db.get(args.id);
    if (!existingTag) {
      throw new Error("Tag not found");
    }

    if (existingTag.orgId !== orgId) {
      throw new Error("Tag not found in your organization");
    }

    // Check permissions: must be creator OR have edit permission
    const canEdit = await hasPermission(ctx, "tags", args.id, "edit");
    if (existingTag.createdBy !== userId && !canEdit) {
      throw new Error("You don't have permission to edit this tag");
    }

    const newName = args.name;

    // If name is being changed, check for duplicates
    if (newName && newName !== existingTag.name) {
      const duplicateTag = await ctx.db
        .query("tags")
        .withIndex("by_org_and_name", (q) =>
          q.eq("orgId", orgId).eq("name", newName),
        )
        .first();

      if (duplicateTag) {
        throw new Error("A tag with this name already exists");
      }
    }

    // Validate answer mode and response time if being updated
    const newAnswerMode = args.answerMode ?? existingTag.answerMode;
    const newResponseTime =
      args.responseTimeMinutes ?? existingTag.responseTimeMinutes;

    if (newAnswerMode === "on-demand" && !newResponseTime) {
      throw new Error("Response time is required for on-demand tags");
    }

    const update: Partial<Doc<"tags">> = {
      updatedAt: Date.now(),
      name: newName,
      description: args.description ?? existingTag.description,
      color: args.color ?? existingTag.color,
      answerMode: newAnswerMode,
      responseTimeMinutes: newResponseTime,
    };

    await ctx.db.patch(args.id, update);

    // Check if fields that affect calculation were changed
    const affectsCalculation =
      args.answerMode !== undefined || args.responseTimeMinutes !== undefined;

    if (affectsCalculation) {
      // Recalculate questions and attention items with this tag
      await ctx.scheduler.runAfter(
        0,
        internal.questions.recalculation.recalculateQuestionsWithTag,
        { tagId: args.id },
      );
      await ctx.scheduler.runAfter(
        0,
        internal.gmail.recalculation.recalculateAttentionItemsWithTags,
        { tagIds: [args.id] },
      );
    }

    return args.id;
  },
});

export const deleteTag = mutation({
  args: {
    id: v.id("tags"),
  },
  handler: async (ctx, args) => {
    const { orgId, id: userId } = await getUser(ctx);

    // Get the existing tag
    const existingTag = await ctx.db.get(args.id);
    if (!existingTag) {
      throw new Error("Tag not found");
    }

    // Check permissions
    if (existingTag.orgId !== orgId) {
      throw new Error("Tag not found in your organization");
    }

    // Check permissions: must be creator OR have manage permission
    const canManage = await hasPermission(ctx, "tags", args.id, "manage");
    if (existingTag.createdBy !== userId && !canManage) {
      throw new Error("You don't have permission to delete this tag");
    }

    // Check if tag is being used by questions or timeblocks
    const allQuestions = await ctx.db
      .query("questions")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .collect();

    const questionsUsingTag = allQuestions.filter((q) =>
      q.tagIds.includes(args.id),
    );

    const allTimeblocks = await ctx.db
      .query("timeblocks")
      .withIndex("by_org_and_creator", (q) => q.eq("orgId", orgId))
      .collect();

    const timeblocksUsingTag = allTimeblocks.filter((tb) =>
      tb.tagIds.includes(args.id),
    );

    if (questionsUsingTag.length > 0 || timeblocksUsingTag.length > 0) {
      throw new Error(
        `Cannot delete tag: used in ${questionsUsingTag.length} questions and ${timeblocksUsingTag.length} timeblocks`,
      );
    }

    // Delete the tag
    await ctx.db.delete(args.id);

    // Recalculate questions and attention items that had this tag
    await ctx.scheduler.runAfter(
      0,
      internal.questions.recalculation.recalculateQuestionsWithTag,
      { tagId: args.id },
    );
    await ctx.scheduler.runAfter(
      0,
      internal.gmail.recalculation.recalculateAttentionItemsWithTags,
      { tagIds: [args.id] },
    );

    return { success: true };
  },
});
