import { v } from "convex/values";
import { Doc } from "../_generated/dataModel";
import { query } from "../_generated/server";
import { getUser } from "../auth/user";

// Get active session for current user
export const getActiveSession = query({
  args: {
    deviceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) return null;

    // First check for active sessions
    let session = await ctx.db
      .query("workSessions")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", user.id).eq("status", "active"),
      )
      .first();

    // If no active session, check for paused sessions
    if (!session) {
      session = await ctx.db
        .query("workSessions")
        .withIndex("by_user_and_status", (q) =>
          q.eq("userId", user.id).eq("status", "paused"),
        )
        .first();
    }

    if (!session) return null;

    // Calculate current actual duration
    let actualDuration = session.actualDuration;
    if (session.status === "active") {
      actualDuration = Date.now() - session.startedAt - session.pausedDuration;
    }

    return {
      ...session,
      actualDuration,
      remainingTime: Math.max(0, session.targetDuration - actualDuration),
      isOnDifferentDevice: args.deviceId
        ? session.deviceId !== args.deviceId
        : false,
    };
  },
});

// Get user's pomodoro settings
export const getPomodoroSettings = query({
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) return null;

    const settings = await ctx.db
      .query("pomodoroSettings")
      .withIndex("by_user_and_org", (q) =>
        q.eq("userId", user.id).eq("orgId", user.orgId),
      )
      .first();

    // Return settings or defaults
    return (
      settings ?? {
        defaultWorkDuration: 25,
        defaultShortBreak: 5,
        defaultLongBreak: 15,
        sessionsBeforeLongBreak: 4,
        presets: {
          deep: { work: 90, shortBreak: 15, longBreak: 30 },
          normal: { work: 25, shortBreak: 5, longBreak: 15 },
          quick: { work: 15, shortBreak: 3, longBreak: 10 },
          review: { work: 45, shortBreak: 10, longBreak: 20 },
        },
        autoStartBreaks: false,
        autoStartWork: false,
        soundEnabled: true,
        notificationsEnabled: true,
        currentFocusMode: "normal" as const,
      }
    );
  },
});

// Get today's sessions for stats
export const getTodaysSessions = query({
  handler: async (ctx) => {
    const user = await getUser(ctx);

    // Get start of today (in user's timezone would be better, but using UTC for now)
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();

    const sessions = await ctx.db
      .query("workSessions")
      .withIndex("by_user_and_org", (q) =>
        q.eq("userId", user.id).eq("orgId", user.orgId),
      )
      .filter((q) => q.gte(q.field("startedAt"), startOfDay))
      .collect();

    // Calculate stats
    const completedSessions = sessions.filter((s) => s.status === "completed");
    const workSessions = completedSessions.filter(
      (s) => s.sessionType === "work",
    );
    const totalFocusTime = workSessions.reduce(
      (sum, s) => sum + s.actualDuration,
      0,
    );
    const totalTasks = workSessions.reduce(
      (sum, s) => sum + s.tasksCompleted.length,
      0,
    );
    const totalQuestions = workSessions.reduce(
      (sum, s) => sum + s.questionsAnswered.length,
      0,
    );

    return {
      sessions: sessions.map((s) => ({
        ...s,
        actualDuration:
          s.status === "active"
            ? Date.now() - s.startedAt - s.pausedDuration
            : s.actualDuration,
      })),
      stats: {
        totalSessions: workSessions.length,
        totalFocusTime,
        totalTasks,
        totalQuestions,
        currentStreak: calculateStreak(workSessions),
      },
    };
  },
});

// Get current timeblock for user
export const getCurrentTimeblock = query({
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) return null;

    const now = Date.now();

    // Get all timeblocks for the user
    const timeblocks = await ctx.db
      .query("timeblocks")
      .withIndex("by_org_and_creator", (q) =>
        q.eq("orgId", user.orgId).eq("createdBy", user.id),
      )
      .collect();

    // Find timeblock that contains current time
    // For now, we'll just check non-recurring timeblocks
    // TODO: Handle recurring timeblocks in the future
    const currentTimeblock = timeblocks.find(
      (tb) => tb.startTime <= now && tb.endTime >= now,
    );

    if (!currentTimeblock) return null;

    // Get tasks for this timeblock
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_timeblock", (q) => q.eq("timeblockId", currentTimeblock._id))
      .order("asc")
      .collect();

    return {
      timeblock: currentTimeblock,
      tasks: tasks.sort((a, b) => a.order - b.order),
    };
  },
});

// Get timeblock with tasks by ID
export const getTimeblockWithTasks = query({
  args: {
    timeblockId: v.id("timeblocks"),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) return null;

    const timeblock = await ctx.db.get(args.timeblockId);
    if (!timeblock || timeblock.orgId !== user.orgId) return null;

    // Get tasks for this timeblock
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_timeblock", (q) => q.eq("timeblockId", args.timeblockId))
      .order("asc")
      .collect();

    return {
      timeblock,
      tasks: tasks.sort((a, b) => a.order - b.order),
    };
  },
});

// Get team work status
export const getTeamWorkStatus = query({
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) return [];

    const teamStatus = await ctx.db
      .query("userWorkStatus")
      .withIndex("by_org", (q) => q.eq("orgId", user.orgId))
      .filter((q) => q.neq(q.field("userId"), user.id))
      .collect();

    // Filter out stale statuses (older than 1 hour)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const activeStatus = teamStatus.filter((s) => s.lastUpdated > oneHourAgo);

    // Get user details and current work info
    const enrichedStatus = await Promise.all(
      activeStatus.map(async (status) => {
        let taskTitle: string | undefined;
        let questionTitle: string | undefined;
        let timeblockTitle: string | undefined;

        if (status.shareDetails) {
          if (status.currentTaskId) {
            const task = await ctx.db.get(status.currentTaskId);
            taskTitle = task?.title;
          }
          if (status.currentQuestionId) {
            const question = await ctx.db.get(status.currentQuestionId);
            questionTitle = question?.title;
          }
          if (status.currentTimeblockId) {
            const timeblock = await ctx.db.get(status.currentTimeblockId);
            timeblockTitle = timeblock?.title;
          }
        }

        return {
          ...status,
          taskTitle,
          questionTitle,
          timeblockTitle,
          timeRemaining: status.expectedEndAt
            ? Math.max(0, status.expectedEndAt - Date.now())
            : undefined,
        };
      }),
    );

    return enrichedStatus;
  },
});

// Get session history for analytics
export const getSessionHistory = query({
  args: {
    days: v.optional(v.number()), // number of days to look back (default 7)
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) return [];

    const days = args.days ?? 7;
    const startDate = Date.now() - days * 24 * 60 * 60 * 1000;

    const sessions = await ctx.db
      .query("workSessions")
      .withIndex("by_user_and_org", (q) =>
        q.eq("userId", user.id).eq("orgId", user.orgId),
      )
      .filter((q) => q.gte(q.field("startedAt"), startDate))
      .order("desc")
      .collect();

    // Group by day and calculate daily stats
    const dailyStats = new Map<string, any>();

    sessions.forEach((session) => {
      const date = new Date(session.startedAt).toISOString().split("T")[0];

      if (!dailyStats.has(date)) {
        dailyStats.set(date, {
          date,
          totalSessions: 0,
          totalFocusTime: 0,
          totalBreakTime: 0,
          tasksCompleted: 0,
          questionsAnswered: 0,
        });
      }

      const stats = dailyStats.get(date);

      if (session.status === "completed") {
        stats.totalSessions++;

        if (session.sessionType === "work") {
          stats.totalFocusTime += session.actualDuration;
        } else {
          stats.totalBreakTime += session.actualDuration;
        }

        stats.tasksCompleted += session.tasksCompleted.length;
        stats.questionsAnswered += session.questionsAnswered.length;
      }
    });

    return Array.from(dailyStats.values()).sort((a, b) =>
      b.date.localeCompare(a.date),
    );
  },
});

// Helper function to calculate streak
function calculateStreak(sessions: Doc<"workSessions">[]): number {
  if (sessions.length === 0) return 0;

  // Sort sessions by date (newest first)
  const sortedSessions = [...sessions].sort(
    (a, b) => b.startedAt - a.startedAt,
  );

  let streak = 0;
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  // Check if there's a session today
  const todaySession = sortedSessions.find((s) => {
    const sessionDate = new Date(s.startedAt);
    sessionDate.setHours(0, 0, 0, 0);
    return sessionDate.getTime() === currentDate.getTime();
  });

  if (!todaySession) {
    // If no session today, check if there was one yesterday
    currentDate.setDate(currentDate.getDate() - 1);
    const yesterdaySession = sortedSessions.find((s) => {
      const sessionDate = new Date(s.startedAt);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === currentDate.getTime();
    });

    if (!yesterdaySession) return 0;
  }

  // Count consecutive days with sessions
  const dates = new Set<string>();
  sortedSessions.forEach((s) => {
    const date = new Date(s.startedAt).toISOString().split("T")[0];
    dates.add(date);
  });

  const sortedDates = Array.from(dates).sort().reverse();

  for (let i = 0; i < sortedDates.length; i++) {
    const expectedDate = new Date(currentDate);
    expectedDate.setDate(expectedDate.getDate() - i);
    const expected = expectedDate.toISOString().split("T")[0];

    if (sortedDates[i] === expected) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
