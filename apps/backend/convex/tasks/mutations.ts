import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getExistingTimeblock } from "../timeblocks/permissions";
import { clearOtherWorkingTasks } from "./helpers";

const MAX_TASKS_PER_TIMEBLOCK = 20;

export const create = mutation({
  args: {
    timeblockId: v.id("timeblocks"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const userId = identity.subject;
    const orgId = identity.orgId as string | undefined;
    if (!orgId) throw new Error("No organization context");

    // Verify user is timeblock owner
    const timeblock = await getExistingTimeblock({
      ctx,
      args: { id: args.timeblockId },
      orgId,
      userId,
      requiredPermission: null,
    });

    if (timeblock.createdBy !== userId) {
      throw new Error("Only timeblock owner can add tasks");
    }

    // Check task limit
    const existingTasks = await ctx.db
      .query("tasks")
      .withIndex("by_timeblock", (q) => q.eq("timeblockId", args.timeblockId))
      .collect();

    if (existingTasks.length >= MAX_TASKS_PER_TIMEBLOCK) {
      throw new Error(`Maximum ${MAX_TASKS_PER_TIMEBLOCK} tasks per timeblock`);
    }

    // Get highest order number
    const maxOrder =
      existingTasks.length > 0
        ? Math.max(...existingTasks.map((t) => t.order))
        : -1;

    const taskId = await ctx.db.insert("tasks", {
      timeblockId: args.timeblockId,
      title: args.title,
      completed: false,
      order: maxOrder + 1,
      currentlyWorkingOn: false,
      orgId,
      createdBy: userId,
      createdAt: Date.now(),
    });

    return taskId;
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    completed: v.optional(v.boolean()),
    currentlyWorkingOn: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const userId = identity.subject;
    const orgId = identity.orgId as string | undefined;
    if (!orgId) throw new Error("No organization context");

    const task = await ctx.db.get(args.id);
    if (!task) throw new Error("Task not found");
    if (task.orgId !== orgId) throw new Error("Task not in organization");

    // Verify user is timeblock owner
    const timeblock = await getExistingTimeblock({
      ctx,
      args: { id: task.timeblockId },
      orgId,
      userId,
      requiredPermission: null,
    });

    if (timeblock.createdBy !== userId) {
      throw new Error("Only timeblock owner can update tasks");
    }

    const updates: Partial<typeof task> = {};

    if (args.title !== undefined) {
      updates.title = args.title;
    }

    if (args.completed !== undefined) {
      updates.completed = args.completed;
      updates.completedAt = args.completed ? Date.now() : undefined;
    }

    if (args.currentlyWorkingOn !== undefined) {
      updates.currentlyWorkingOn = args.currentlyWorkingOn;

      // If setting this task as "currently working on", clear all others
      if (args.currentlyWorkingOn) {
        await clearOtherWorkingTasks(ctx, task.timeblockId, args.id);
      }
    }

    await ctx.db.patch(args.id, updates);
  },
});

export const remove = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const userId = identity.subject;
    const orgId = identity.orgId as string | undefined;
    if (!orgId) throw new Error("No organization context");

    const task = await ctx.db.get(args.id);
    if (!task) throw new Error("Task not found");
    if (task.orgId !== orgId) throw new Error("Task not in organization");

    // Verify user is timeblock owner
    const timeblock = await getExistingTimeblock({
      ctx,
      args: { id: task.timeblockId },
      orgId,
      userId,
      requiredPermission: null,
    });

    if (timeblock.createdBy !== userId) {
      throw new Error("Only timeblock owner can delete tasks");
    }

    await ctx.db.delete(args.id);
  },
});

export const reorder = mutation({
  args: {
    timeblockId: v.id("timeblocks"),
    taskIds: v.array(v.id("tasks")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const userId = identity.subject;
    const orgId = identity.orgId as string | undefined;
    if (!orgId) throw new Error("No organization context");

    // Verify user is timeblock owner
    const timeblock = await getExistingTimeblock({
      ctx,
      args: { id: args.timeblockId },
      orgId,
      userId,
      requiredPermission: null,
    });

    if (timeblock.createdBy !== userId) {
      throw new Error("Only timeblock owner can reorder tasks");
    }

    // Update order for each task
    for (let i = 0; i < args.taskIds.length; i++) {
      const taskId = args.taskIds[i];
      const task = await ctx.db.get(taskId);

      if (!task) continue;
      if (task.timeblockId !== args.timeblockId) continue;
      if (task.orgId !== orgId) continue;

      await ctx.db.patch(taskId, { order: i });
    }
  },
});

export const batchCreate = mutation({
  args: {
    timeblockId: v.id("timeblocks"),
    tasks: v.array(
      v.object({
        title: v.string(),
        completed: v.boolean(),
        order: v.number(),
        currentlyWorkingOn: v.boolean(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const userId = identity.subject;
    const orgId = identity.orgId as string | undefined;
    if (!orgId) throw new Error("No organization context");

    // Verify user is timeblock owner
    const timeblock = await getExistingTimeblock({
      ctx,
      args: { id: args.timeblockId },
      orgId,
      userId,
      requiredPermission: null,
    });

    if (timeblock.createdBy !== userId) {
      throw new Error("Only timeblock owner can add tasks");
    }

    // Check task limit
    const existingTasks = await ctx.db
      .query("tasks")
      .withIndex("by_timeblock", (q) => q.eq("timeblockId", args.timeblockId))
      .collect();

    if (existingTasks.length + args.tasks.length > MAX_TASKS_PER_TIMEBLOCK) {
      throw new Error(`Maximum ${MAX_TASKS_PER_TIMEBLOCK} tasks per timeblock`);
    }

    // Create all tasks
    const taskIds = [];
    for (const task of args.tasks) {
      const taskId = await ctx.db.insert("tasks", {
        timeblockId: args.timeblockId,
        title: task.title,
        completed: task.completed,
        order: task.order,
        currentlyWorkingOn: task.currentlyWorkingOn,
        orgId,
        createdBy: userId,
        createdAt: Date.now(),
        completedAt: task.completed ? Date.now() : undefined,
      });
      taskIds.push(taskId);
    }

    return taskIds;
  },
});

export const syncTimeblockTasks = mutation({
  args: {
    timeblockId: v.id("timeblocks"),
    tasks: v.array(
      v.object({
        title: v.string(),
        completed: v.boolean(),
        order: v.number(),
        currentlyWorkingOn: v.boolean(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const userId = identity.subject;
    const orgId = identity.orgId as string | undefined;
    if (!orgId) throw new Error("No organization context");

    // Verify user is timeblock owner
    const timeblock = await getExistingTimeblock({
      ctx,
      args: { id: args.timeblockId },
      orgId,
      userId,
      requiredPermission: null,
    });

    if (timeblock.createdBy !== userId) {
      throw new Error("Only timeblock owner can modify tasks");
    }

    // Check task limit
    if (args.tasks.length > MAX_TASKS_PER_TIMEBLOCK) {
      throw new Error(`Maximum ${MAX_TASKS_PER_TIMEBLOCK} tasks per timeblock`);
    }

    // Delete all existing tasks for this timeblock
    const existingTasks = await ctx.db
      .query("tasks")
      .withIndex("by_timeblock", (q) => q.eq("timeblockId", args.timeblockId))
      .collect();

    for (const task of existingTasks) {
      await ctx.db.delete(task._id);
    }

    // Create all new tasks
    const taskIds = [];
    for (const task of args.tasks) {
      const taskId = await ctx.db.insert("tasks", {
        timeblockId: args.timeblockId,
        title: task.title,
        completed: task.completed,
        order: task.order,
        currentlyWorkingOn: task.currentlyWorkingOn,
        orgId,
        createdBy: userId,
        createdAt: Date.now(),
        completedAt: task.completed ? Date.now() : undefined,
      });
      taskIds.push(taskId);
    }

    return taskIds;
  },
});
