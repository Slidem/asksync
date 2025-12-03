import {
  addOptionalValue,
  validateRecurringTimeblock,
  validateTimeRange,
} from "./helpers";
/* eslint-disable import/order */
import { getExistingTimeblock, validateTagsPermissions } from "./permissions";

import { Doc } from "../_generated/dataModel";
import { PatchValue } from "../common/types";
import { getUser } from "../auth/user";
import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

// Create a new timeblock
export const createTimeblock = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.number(),
    timezone: v.string(),
    recurrenceRule: v.optional(
      v.union(
        v.null(),
        v.literal("FREQ=DAILY"),
        v.literal("FREQ=WEEKLY"),
        v.literal("FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR"),
      ),
    ),
    tagIds: v.array(v.string()),
    color: v.optional(v.string()),
    checklistsVisible: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { orgId, id: userId } = await getUser(ctx);

    validateTimeRange(args.startTime, args.endTime);
    await validateTagsPermissions(args, ctx, orgId);

    const timeblockId = await ctx.db.insert("timeblocks", {
      orgId,
      createdBy: userId,
      title: args.title,
      description: args.description,
      location: args.location,
      startTime: args.startTime,
      endTime: args.endTime,
      timezone: args.timezone,
      recurrenceRule: args.recurrenceRule,
      tagIds: args.tagIds,
      color: args.color,
      checklistsVisible: args.checklistsVisible ?? false,
      source: "asksync",
      updatedAt: Date.now(),
    });

    // Grant manage permission to creator
    await ctx.db.insert("permissions", {
      all: false,
      userId,
      orgId,
      resourceType: "timeblocks",
      resourceId: timeblockId,
      permission: "manage",
      createdBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Schedule recalculation for affected questions
    await ctx.scheduler.runAfter(
      0,
      internal.questions.recalculation.recalculateQuestionsWithTags,
      {
        tagIds: args.tagIds,
        assigneeId: userId,
      },
    );

    return timeblockId;
  },
});

// Update an existing timeblock
export const updateTimeblock = mutation({
  args: {
    id: v.id("timeblocks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    timezone: v.optional(v.string()),
    recurrenceRule: v.optional(
      v.union(
        v.null(),
        v.literal("FREQ=DAILY"),
        v.literal("FREQ=WEEKLY"),
        v.literal("FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR"),
      ),
    ),
    tagIds: v.optional(v.array(v.string())),
    color: v.optional(v.string()),
    checklistsVisible: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { orgId, id: userId } = await getUser(ctx);

    const existingTimeblock = await getExistingTimeblock({
      ctx,
      args,
      orgId,
      userId,
      requiredPermission: "edit",
    });

    const newStartTime = args.startTime ?? existingTimeblock.startTime;
    const newEndTime = args.endTime ?? existingTimeblock.endTime;
    validateTimeRange(newStartTime, newEndTime);

    await validateTagsPermissions(args, ctx, orgId);

    // Prepare update data
    const updateData: PatchValue<Doc<"timeblocks">> = {
      updatedAt: Date.now(),
    };

    addOptionalValue(updateData, "title", args.title);
    addOptionalValue(updateData, "description", args.description);
    addOptionalValue(updateData, "location", args.location);
    addOptionalValue(updateData, "startTime", args.startTime);
    addOptionalValue(updateData, "endTime", args.endTime);
    addOptionalValue(updateData, "timezone", args.timezone);
    addOptionalValue(updateData, "recurrenceRule", args.recurrenceRule);
    addOptionalValue(updateData, "tagIds", args.tagIds);
    addOptionalValue(updateData, "color", args.color);
    addOptionalValue(updateData, "checklistsVisible", args.checklistsVisible);

    await ctx.db.patch(args.id, updateData);

    // Check if any fields that affect calculation were changed
    const affectsCalculation =
      args.tagIds !== undefined ||
      args.startTime !== undefined ||
      args.endTime !== undefined ||
      args.recurrenceRule !== undefined;

    if (affectsCalculation) {
      // Get union of old and new tag IDs
      const oldTagIds = existingTimeblock.tagIds;
      const newTagIds = args.tagIds ?? oldTagIds;
      const allTagIds = Array.from(new Set([...oldTagIds, ...newTagIds]));

      // Schedule recalculation for affected questions
      await ctx.scheduler.runAfter(
        0,
        internal.questions.recalculation.recalculateQuestionsWithTags,
        {
          tagIds: allTagIds,
          assigneeId: existingTimeblock.createdBy,
        },
      );
    }

    return args.id;
  },
});

export const deleteTimeblock = mutation({
  args: {
    id: v.id("timeblocks"),
  },
  handler: async (ctx, args) => {
    const { orgId, id: userId } = await getUser(ctx);

    // validate existence and permissions
    const timeblock = await getExistingTimeblock({
      ctx,
      args,
      orgId,
      userId,
      requiredPermission: "manage",
    });

    await ctx.db.delete(args.id);

    // Schedule recalculation for affected questions
    await ctx.scheduler.runAfter(
      0,
      internal.questions.recalculation.recalculateQuestionsWithTags,
      {
        tagIds: timeblock.tagIds,
        assigneeId: timeblock.createdBy,
      },
    );

    return args.id;
  },
});

export const addTimeblockException = mutation({
  args: {
    timeblockId: v.id("timeblocks"),
    exceptionDate: v.number(),
  },
  handler: async (ctx, args) => {
    const { orgId, id: userId } = await getUser(ctx);
    const timeblock = await getExistingTimeblock({
      ctx,
      args: { id: args.timeblockId },
      orgId,
      userId,
      requiredPermission: "edit",
    });

    validateRecurringTimeblock(timeblock);

    const currentExceptions = new Set<number>(timeblock.exceptionDates || []);
    currentExceptions.add(args.exceptionDate);

    await ctx.db.patch(args.timeblockId, {
      exceptionDates: Array.from(currentExceptions),
      updatedAt: Date.now(),
    });

    // Schedule recalculation for affected questions
    await ctx.scheduler.runAfter(
      0,
      internal.questions.recalculation.recalculateQuestionsWithTags,
      {
        tagIds: timeblock.tagIds,
        assigneeId: timeblock.createdBy,
      },
    );

    return timeblock._id;
  },
});
