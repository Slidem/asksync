import { RecurrenceRule } from "@asksync/shared";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

// List timeblocks for the current organization and user
export const listTimeblocksByUser = query({
  args: {
    userId: v.optional(v.string()),
    includeAll: v.optional(v.boolean()), // if true, include all org timeblocks
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const orgId = identity.orgId;
    if (!orgId || typeof orgId !== "string") {
      throw new Error("No organization found");
    }

    const userId = args.userId || identity.subject;

    if (args.includeAll) {
      // Return all timeblocks in the organization
      return await ctx.db
        .query("timeblocks")
        .withIndex("by_org_and_user", (q) => q.eq("orgId", orgId))
        .collect();
    } else {
      // Return only the user's timeblocks
      return await ctx.db
        .query("timeblocks")
        .withIndex("by_org_and_user", (q) =>
          q.eq("orgId", orgId).eq("userId", userId),
        )
        .collect();
    }
  },
});

// List timeblocks for a specific time range
export const listTimeblocksByRange = query({
  args: {
    startTime: v.number(),
    endTime: v.number(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const orgId = identity.orgId;
    if (!orgId || typeof orgId !== "string") {
      throw new Error("No organization found");
    }

    const userId = args.userId || identity.subject;

    // Get all timeblocks for the user in the org
    const timeblocks = await ctx.db
      .query("timeblocks")
      .withIndex("by_org_and_user", (q) =>
        q.eq("orgId", orgId).eq("userId", userId),
      )
      .filter((q) =>
        q.and(
          q.gte(q.field("endTime"), args.startTime),
          q.lte(q.field("startTime"), args.endTime),
        ),
      )
      .collect();

    return timeblocks;
  },
});

// Get timeblocks associated with specific tags
export const listTimeblocksByTags = query({
  args: {
    tagIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const orgId = identity.orgId;
    if (!orgId || typeof orgId !== "string") {
      throw new Error("No organization found");
    }

    // Get all timeblocks for the org and filter in JavaScript
    const allTimeblocks = await ctx.db
      .query("timeblocks")
      .withIndex("by_org_and_user", (q) => q.eq("orgId", orgId))
      .collect();

    // Filter timeblocks that include any of the specified tags
    const filteredTimeblocks = allTimeblocks.filter((timeblock) =>
      timeblock.tagIds.some((tagId) => args.tagIds.includes(tagId)),
    );

    return filteredTimeblocks;
  },
});

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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const orgId = identity.orgId;
    if (!orgId || typeof orgId !== "string") {
      throw new Error("No organization found");
    }

    // Validate that end time is after start time
    if (args.endTime <= args.startTime) {
      throw new Error("End time must be after start time");
    }

    // Validate that all referenced tags exist and are accessible
    for (const tagId of args.tagIds) {
      const tag = await ctx.db.get(tagId as Id<"tags">);
      if (!tag) {
        throw new Error(`Tag with ID ${tagId} not found`);
      }
      if (tag.orgId !== orgId) {
        throw new Error(`Tag with ID ${tagId} not accessible`);
      }
    }

    const now = Date.now();

    const timeblockId = await ctx.db.insert("timeblocks", {
      title: args.title,
      description: args.description,
      startTime: args.startTime,
      endTime: args.endTime,
      timezone: args.timezone,
      isRecurring: args.isRecurring,
      recurrenceRule: args.recurrenceRule,
      tagIds: args.tagIds,
      color: args.color,
      userId: identity.subject,
      orgId,
      source: "asksync",
      updatedAt: now,
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const orgId = identity.orgId;
    if (!orgId || typeof orgId !== "string") {
      throw new Error("No organization found");
    }

    // Get the existing timeblock
    const existingTimeblock = await ctx.db.get(args.id);
    if (!existingTimeblock) {
      throw new Error("Timeblock not found");
    }

    // Check permissions
    if (existingTimeblock.orgId !== orgId) {
      throw new Error("Not authorized to update this timeblock");
    }
    if (existingTimeblock.userId !== identity.subject) {
      throw new Error("Can only update your own timeblocks");
    }

    // Validate time constraints if provided
    const newStartTime = args.startTime ?? existingTimeblock.startTime;
    const newEndTime = args.endTime ?? existingTimeblock.endTime;
    if (newEndTime <= newStartTime) {
      throw new Error("End time must be after start time");
    }

    // Validate that all referenced tags exist and are accessible
    if (args.tagIds) {
      for (const tagId of args.tagIds) {
        const tag = await ctx.db.get(tagId as Id<"tags">);
        if (!tag) {
          throw new Error(`Tag with ID ${tagId} not found`);
        }
        if (tag.orgId !== orgId) {
          throw new Error(`Tag with ID ${tagId} not accessible`);
        }
      }
    }

    // Prepare update data
    const updateData: Partial<{
      title: string;
      description?: string;
      startTime: number;
      endTime: number;
      timezone: string;
      isRecurring: boolean;
      recurrenceRule?: RecurrenceRule;
      tagIds: string[];
      color?: string;
      updatedAt: number;
    }> = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) updateData.title = args.title;
    if (args.description !== undefined)
      updateData.description = args.description;
    if (args.startTime !== undefined) updateData.startTime = args.startTime;
    if (args.endTime !== undefined) updateData.endTime = args.endTime;
    if (args.timezone !== undefined) updateData.timezone = args.timezone;
    if (args.isRecurring !== undefined)
      updateData.isRecurring = args.isRecurring;
    if (args.recurrenceRule !== undefined)
      updateData.recurrenceRule = args.recurrenceRule as RecurrenceRule;
    if (args.tagIds !== undefined) updateData.tagIds = args.tagIds;
    if (args.color !== undefined) updateData.color = args.color;

    await ctx.db.patch(args.id, updateData);
    return args.id;
  },
});

// Delete a timeblock
export const deleteTimeblock = mutation({
  args: {
    id: v.id("timeblocks"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const orgId = identity.orgId;
    if (!orgId || typeof orgId !== "string") {
      throw new Error("No organization found");
    }

    // Get the timeblock
    const timeblock = await ctx.db.get(args.id);
    if (!timeblock) {
      throw new Error("Timeblock not found");
    }

    // Check permissions
    if (timeblock.orgId !== orgId) {
      throw new Error("Not authorized to delete this timeblock");
    }
    if (timeblock.userId !== identity.subject) {
      throw new Error("Can only delete your own timeblocks");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Get availability for a user based on their timeblocks and tags
export const getUserAvailability = query({
  args: {
    userId: v.string(),
    tagIds: v.array(v.string()),
    startTime: v.number(),
    endTime: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const orgId = identity.orgId;
    if (!orgId || typeof orgId !== "string") {
      throw new Error("No organization found");
    }

    // Get all timeblocks for the user that overlap with the time range
    const allTimeblocks = await ctx.db
      .query("timeblocks")
      .withIndex("by_org_and_user", (q) =>
        q.eq("orgId", orgId).eq("userId", args.userId),
      )
      .filter((q) =>
        q.and(
          q.gte(q.field("endTime"), args.startTime),
          q.lte(q.field("startTime"), args.endTime),
        ),
      )
      .collect();

    // Filter timeblocks that include any of the specified tags
    const timeblocks = allTimeblocks.filter((timeblock) =>
      timeblock.tagIds.some((tagId) => args.tagIds.includes(tagId)),
    );

    return {
      isAvailable: timeblocks.length > 0,
      timeblocks,
      availableSlots: timeblocks.map((tb) => ({
        startTime: Math.max(tb.startTime, args.startTime),
        endTime: Math.min(tb.endTime, args.endTime),
        timeblockId: tb._id,
        tags: tb.tagIds,
      })),
    };
  },
});

// Add exception date to a recurring timeblock
export const addTimeblockException = mutation({
  args: {
    timeblockId: v.id("timeblocks"),
    exceptionDate: v.number(), // UTC midnight timestamp
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const orgId = identity.orgId;
    if (!orgId || typeof orgId !== "string") {
      throw new Error("No organization found");
    }

    // Get the timeblock
    const timeblock = await ctx.db.get(args.timeblockId);
    if (!timeblock) {
      throw new Error("Timeblock not found");
    }

    // Check permissions
    if (timeblock.orgId !== orgId) {
      throw new Error("Not authorized to modify this timeblock");
    }
    if (timeblock.userId !== identity.subject) {
      throw new Error("Can only modify your own timeblocks");
    }

    // Check if it's a recurring timeblock
    if (!timeblock.isRecurring) {
      throw new Error("Can only add exceptions to recurring timeblocks");
    }

    // Get current exceptions or initialize empty array
    const currentExceptions = timeblock.exceptionDates || [];

    // Check if exception already exists
    if (currentExceptions.includes(args.exceptionDate)) {
      return timeblock._id; // Already exists, no need to add
    }

    // Add the new exception
    const updatedExceptions = [...currentExceptions, args.exceptionDate];

    await ctx.db.patch(args.timeblockId, {
      exceptionDates: updatedExceptions,
      updatedAt: Date.now(),
    });

    return timeblock._id;
  },
});

// Remove exception date from a recurring timeblock
export const removeTimeblockException = mutation({
  args: {
    timeblockId: v.id("timeblocks"),
    exceptionDate: v.number(), // UTC midnight timestamp
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const orgId = identity.orgId;
    if (!orgId || typeof orgId !== "string") {
      throw new Error("No organization found");
    }

    // Get the timeblock
    const timeblock = await ctx.db.get(args.timeblockId);
    if (!timeblock) {
      throw new Error("Timeblock not found");
    }

    // Check permissions
    if (timeblock.orgId !== orgId) {
      throw new Error("Not authorized to modify this timeblock");
    }
    if (timeblock.userId !== identity.subject) {
      throw new Error("Can only modify your own timeblocks");
    }

    // Get current exceptions
    const currentExceptions = timeblock.exceptionDates || [];

    // Remove the exception
    const updatedExceptions = currentExceptions.filter(
      (date) => date !== args.exceptionDate,
    );

    await ctx.db.patch(args.timeblockId, {
      exceptionDates: updatedExceptions,
      updatedAt: Date.now(),
    });

    return timeblock._id;
  },
});
