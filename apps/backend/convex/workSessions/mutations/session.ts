import { ConvexError, v } from "convex/values";
import { mutation } from "../../_generated/server";
import { getUser } from "../../auth/user";
import { clearOtherWorkingTasks } from "../../tasks/helpers";

// Start a new work session
export const startSession = mutation({
  args: {
    sessionType: v.union(
      v.literal("work"),
      v.literal("shortBreak"),
      v.literal("longBreak"),
    ),
    targetDuration: v.number(), // in milliseconds
    focusMode: v.union(
      v.literal("deep"),
      v.literal("normal"),
      v.literal("quick"),
      v.literal("review"),
      v.literal("custom"),
    ),
    customDuration: v.optional(v.number()),
    timeblockId: v.optional(v.id("timeblocks")),
    taskId: v.optional(v.id("tasks")),
    deviceId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new ConvexError("Not authenticated");

    // End any active sessions for this user
    const activeSessions = await ctx.db
      .query("workSessions")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", user.id).eq("status", "active"),
      )
      .collect();

    for (const session of activeSessions) {
      await ctx.db.patch(session._id, {
        status: "completed",
        endedAt: Date.now(),
        actualDuration: Date.now() - session.startedAt - session.pausedDuration,
        updatedAt: Date.now(),
      });
    }

    // Determine timeblock to use
    let timeblockId = args.timeblockId;
    if (!timeblockId) {
      // Try to find current timeblock based on current time
      const now = Date.now();
      const timeblocks = await ctx.db
        .query("timeblocks")
        .withIndex("by_org_and_creator", (q) =>
          q.eq("orgId", user.orgId).eq("createdBy", user.id),
        )
        .collect();

      const currentTimeblock = timeblocks.find(
        (tb) => tb.startTime <= now && tb.endTime >= now,
      );

      timeblockId = currentTimeblock?._id;
    }

    // Create new session
    const sessionId = await ctx.db.insert("workSessions", {
      userId: user.id,
      orgId: user.orgId,
      sessionType: args.sessionType,
      timeblockId,
      taskId: args.taskId,
      questionId: undefined,
      startedAt: Date.now(),
      endedAt: undefined,
      pausedDuration: 0,
      targetDuration: args.targetDuration,
      actualDuration: 0,
      focusMode: args.focusMode,
      customDuration: args.customDuration,
      tasksCompleted: [],
      questionsAnswered: [],
      status: "active",
      deviceId: args.deviceId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update user work status
    const existingStatus = await ctx.db
      .query("userWorkStatus")
      .withIndex("by_user_and_org", (q) =>
        q.eq("userId", user.id).eq("orgId", user.orgId),
      )
      .first();

    const statusData = {
      userId: user.id,
      orgId: user.orgId,
      status:
        args.sessionType === "work" ? ("working" as const) : ("break" as const),
      currentTaskId: args.taskId,
      currentQuestionId: undefined,
      currentTimeblockId: timeblockId,
      sessionStartedAt: Date.now(),
      expectedEndAt: Date.now() + args.targetDuration,
      focusMode: args.focusMode,
      sessionType: args.sessionType,
      shareDetails: true,
      lastUpdated: Date.now(),
    };

    if (existingStatus) {
      await ctx.db.patch(existingStatus._id, statusData);
    } else {
      await ctx.db.insert("userWorkStatus", statusData);
    }

    return sessionId;
  },
});

// Pause current session
export const pauseSession = mutation({
  args: {
    sessionId: v.id("workSessions"),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new ConvexError("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new ConvexError("Session not found");
    if (session.userId !== user.id) throw new ConvexError("Not authorized");
    if (session.status !== "active")
      throw new ConvexError("Session not active");

    const now = Date.now();
    const actualDuration = now - session.startedAt - session.pausedDuration;

    await ctx.db.patch(args.sessionId, {
      status: "paused",
      actualDuration,
      updatedAt: now,
    });

    // Update user status
    const status = await ctx.db
      .query("userWorkStatus")
      .withIndex("by_user_and_org", (q) =>
        q.eq("userId", user.id).eq("orgId", user.orgId),
      )
      .first();

    if (status) {
      await ctx.db.patch(status._id, {
        status: "offline",
        lastUpdated: now,
      });
    }

    return { success: true };
  },
});

// Resume paused session
export const resumeSession = mutation({
  args: {
    sessionId: v.id("workSessions"),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new ConvexError("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new ConvexError("Session not found");
    if (session.userId !== user.id) throw new ConvexError("Not authorized");
    if (session.status !== "paused")
      throw new ConvexError("Session not paused");

    const now = Date.now();
    const pauseDuration = now - session.updatedAt;

    await ctx.db.patch(args.sessionId, {
      status: "active",
      pausedDuration: session.pausedDuration + pauseDuration,
      updatedAt: now,
    });

    // Update user status
    const status = await ctx.db
      .query("userWorkStatus")
      .withIndex("by_user_and_org", (q) =>
        q.eq("userId", user.id).eq("orgId", user.orgId),
      )
      .first();

    if (status) {
      await ctx.db.patch(status._id, {
        status:
          session.sessionType === "work"
            ? ("working" as const)
            : ("break" as const),
        expectedEndAt: now + (session.targetDuration - session.actualDuration),
        lastUpdated: now,
      });
    }

    return { success: true };
  },
});

// End session (complete or skip)
export const endSession = mutation({
  args: {
    sessionId: v.id("workSessions"),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new ConvexError("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new ConvexError("Session not found");
    if (session.userId !== user.id) throw new ConvexError("Not authorized");

    const now = Date.now();
    const actualDuration =
      session.status === "active"
        ? now - session.startedAt - session.pausedDuration
        : session.actualDuration;

    await ctx.db.patch(args.sessionId, {
      status: args.completed ? "completed" : "skipped",
      endedAt: now,
      actualDuration,
      updatedAt: now,
    });

    // Update user status to offline
    const status = await ctx.db
      .query("userWorkStatus")
      .withIndex("by_user_and_org", (q) =>
        q.eq("userId", user.id).eq("orgId", user.orgId),
      )
      .first();

    if (status) {
      await ctx.db.patch(status._id, {
        status: "offline",
        sessionStartedAt: undefined,
        expectedEndAt: undefined,
        currentTaskId: undefined,
        currentQuestionId: undefined,
        currentTimeblockId: undefined,
        lastUpdated: now,
      });
    }

    // Clear "currently working on" flags for all tasks in this session's timeblock
    if (session.timeblockId) {
      await clearOtherWorkingTasks(ctx, session.timeblockId);
    }

    return { success: true };
  },
});
