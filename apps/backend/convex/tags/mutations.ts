/* eslint-disable import/order */
import { Doc } from "../_generated/dataModel";
import { getUser } from "../auth/user";
import { hasPermission } from "../permissions/common";
import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createTag = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    color: v.string(),
    answerMode: v.union(v.literal("on-demand"), v.literal("scheduled")),
    responseTimeMinutes: v.optional(v.number()),
    isPublic: v.optional(v.boolean()),
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
      isPublic: args.isPublic ?? true,
    });

    // Grant manage permission to creator
    await ctx.db.insert("permissions", {
      all: false,
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
    isPublic: v.optional(v.boolean()),
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
      isPublic: args.isPublic ?? existingTag.isPublic,
    };

    await ctx.db.patch(args.id, update);

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

    // TODO: Check if tag is being used by questions or timeblocks
    // For now, we'll allow deletion (later we can add cascade delete or prevent deletion)
    // Delete the tag
    await ctx.db.delete(args.id);

    return { success: true };
  },
});
