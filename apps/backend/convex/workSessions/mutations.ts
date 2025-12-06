import { ConvexError, v } from "convex/values";
import { mutation } from "../_generated/server";
import { getUser } from "../auth/user";

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

    // Create new session
    const sessionId = await ctx.db.insert("workSessions", {
      userId: user.id,
      orgId: user.orgId,
      sessionType: args.sessionType,
      timeblockId: args.timeblockId,
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
      currentTimeblockId: args.timeblockId,
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

    return { success: true };
  },
});

// Update session progress (tasks completed, current focus)
export const updateSessionProgress = mutation({
  args: {
    sessionId: v.id("workSessions"),
    taskId: v.optional(v.id("tasks")),
    questionId: v.optional(v.id("questions")),
    completedTaskId: v.optional(v.id("tasks")),
    answeredQuestionId: v.optional(v.id("questions")),
    timeblockId: v.optional(v.id("timeblocks")),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new ConvexError("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new ConvexError("Session not found");
    if (session.userId !== user.id) throw new ConvexError("Not authorized");

    const updates: any = {
      updatedAt: Date.now(),
    };

    // Update timeblock if provided
    if (args.timeblockId !== undefined) {
      updates.timeblockId = args.timeblockId;
    }

    // Update current task
    if (args.taskId !== undefined) {
      updates.taskId = args.taskId;

      // If setting a task, also mark it as currently working on
      if (args.taskId) {
        const task = await ctx.db.get(args.taskId);
        if (task && task.orgId === user.orgId) {
          // Clear other tasks' currentlyWorkingOn flag for this timeblock
          const allTasks = await ctx.db
            .query("tasks")
            .withIndex("by_timeblock", (q) =>
              q.eq("timeblockId", task.timeblockId),
            )
            .collect();

          for (const t of allTasks) {
            if (t._id !== args.taskId && t.currentlyWorkingOn) {
              await ctx.db.patch(t._id, { currentlyWorkingOn: false });
            }
          }

          // Set this task as currently working on
          await ctx.db.patch(args.taskId, { currentlyWorkingOn: true });
        }
      }
    }

    // Update current question
    if (args.questionId !== undefined) {
      updates.questionId = args.questionId;
    }

    // Add completed task
    if (args.completedTaskId) {
      updates.tasksCompleted = [
        ...session.tasksCompleted,
        args.completedTaskId,
      ];

      // Mark task as completed in tasks table
      const task = await ctx.db.get(args.completedTaskId);
      if (task && task.orgId === user.orgId) {
        await ctx.db.patch(args.completedTaskId, {
          completed: true,
          completedAt: Date.now(),
          currentlyWorkingOn: false,
        });
      }
    }

    // Add answered question
    if (args.answeredQuestionId) {
      updates.questionsAnswered = [
        ...session.questionsAnswered,
        args.answeredQuestionId,
      ];
    }

    await ctx.db.patch(args.sessionId, updates);

    // Update work status if changing current task/question/timeblock
    if (
      args.taskId !== undefined ||
      args.questionId !== undefined ||
      args.timeblockId !== undefined
    ) {
      const status = await ctx.db
        .query("userWorkStatus")
        .withIndex("by_user_and_org", (q) =>
          q.eq("userId", user.id).eq("orgId", user.orgId),
        )
        .first();

      if (status) {
        const statusUpdates: any = {
          lastUpdated: Date.now(),
        };
        if (args.taskId !== undefined) {
          statusUpdates.currentTaskId = args.taskId;
        }
        if (args.questionId !== undefined) {
          statusUpdates.currentQuestionId = args.questionId;
        }
        if (args.timeblockId !== undefined) {
          statusUpdates.currentTimeblockId = args.timeblockId;
        }
        await ctx.db.patch(status._id, statusUpdates);
      }
    }

    return { success: true };
  },
});

// Update or create pomodoro settings
export const updatePomodoroSettings = mutation({
  args: {
    defaultWorkDuration: v.optional(v.number()),
    defaultShortBreak: v.optional(v.number()),
    defaultLongBreak: v.optional(v.number()),
    sessionsBeforeLongBreak: v.optional(v.number()),
    autoStartBreaks: v.optional(v.boolean()),
    autoStartWork: v.optional(v.boolean()),
    soundEnabled: v.optional(v.boolean()),
    notificationsEnabled: v.optional(v.boolean()),
    currentFocusMode: v.optional(
      v.union(
        v.literal("deep"),
        v.literal("normal"),
        v.literal("quick"),
        v.literal("review"),
        v.literal("custom"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new ConvexError("Not authenticated");

    const existing = await ctx.db
      .query("pomodoroSettings")
      .withIndex("by_user_and_org", (q) =>
        q.eq("userId", user.id).eq("orgId", user.orgId),
      )
      .first();

    const defaultPresets = {
      deep: { work: 90, shortBreak: 15, longBreak: 30 },
      normal: { work: 25, shortBreak: 5, longBreak: 15 },
      quick: { work: 15, shortBreak: 3, longBreak: 10 },
      review: { work: 45, shortBreak: 10, longBreak: 20 },
    };

    if (existing) {
      const updates: any = {
        updatedAt: Date.now(),
      };

      Object.keys(args).forEach((key) => {
        if (args[key as keyof typeof args] !== undefined) {
          updates[key] = args[key as keyof typeof args];
        }
      });

      await ctx.db.patch(existing._id, updates);
      return existing._id;
    } else {
      // Create with defaults
      const settingsId = await ctx.db.insert("pomodoroSettings", {
        userId: user.id,
        orgId: user.orgId,
        defaultWorkDuration: args.defaultWorkDuration ?? 25,
        defaultShortBreak: args.defaultShortBreak ?? 5,
        defaultLongBreak: args.defaultLongBreak ?? 15,
        sessionsBeforeLongBreak: args.sessionsBeforeLongBreak ?? 4,
        presets: defaultPresets,
        autoStartBreaks: args.autoStartBreaks ?? false,
        autoStartWork: args.autoStartWork ?? false,
        soundEnabled: args.soundEnabled ?? true,
        notificationsEnabled: args.notificationsEnabled ?? true,
        currentFocusMode: args.currentFocusMode ?? "normal",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      return settingsId;
    }
  },
});
