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

// Create a new timeblock
export const createTimeblock = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.number(),
    timezone: v.string(),
    isRecurring: v.boolean(),
    recurrenceRule: v.optional(
      v.union(
        v.literal("FREQ=DAILY"),
        v.literal("FREQ=WEEKLY"),
        v.literal("FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR"),
      ),
    ),
    tagIds: v.array(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { orgId, id: userId } = await getUser(ctx);

    validateTimeRange(args.startTime, args.endTime);
    await validateTagsPermissions(args, ctx, orgId);

    const timeblockId = await ctx.db.insert("timeblocks", {
      orgId,
      userId,
      title: args.title,
      description: args.description,
      startTime: args.startTime,
      endTime: args.endTime,
      timezone: args.timezone,
      isRecurring: args.isRecurring,
      recurrenceRule: args.recurrenceRule,
      tagIds: args.tagIds,
      color: args.color,
      source: "asksync",
      updatedAt: Date.now(),
    });

    return timeblockId;
  },
});

// Update an existing timeblock
export const updateTimeblock = mutation({
  args: {
    id: v.id("timeblocks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    timezone: v.optional(v.string()),
    isRecurring: v.optional(v.boolean()),
    recurrenceRule: v.optional(
      v.union(
        v.literal("FREQ=DAILY"),
        v.literal("FREQ=WEEKLY"),
        v.literal("FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR"),
      ),
    ),
    tagIds: v.optional(v.array(v.string())),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { orgId, id: userId } = await getUser(ctx);

    const existingTimeblock = await getExistingTimeblock({
      ctx,
      args,
      orgId,
      userId,
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
    addOptionalValue(updateData, "startTime", args.startTime);
    addOptionalValue(updateData, "endTime", args.endTime);
    addOptionalValue(updateData, "timezone", args.timezone);
    addOptionalValue(updateData, "isRecurring", args.isRecurring);
    addOptionalValue(updateData, "recurrenceRule", args.recurrenceRule);
    addOptionalValue(updateData, "tagIds", args.tagIds);
    addOptionalValue(updateData, "color", args.color);

    await ctx.db.patch(args.id, updateData);
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
    await getExistingTimeblock({
      ctx,
      args,
      orgId,
      userId,
    });

    await ctx.db.delete(args.id);

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
    });

    validateRecurringTimeblock(timeblock);

    const currentExceptions = new Set<number>(timeblock.exceptionDates || []);
    currentExceptions.add(args.exceptionDate);

    await ctx.db.patch(args.timeblockId, {
      exceptionDates: Array.from(currentExceptions),
      updatedAt: Date.now(),
    });

    return timeblock._id;
  },
});
