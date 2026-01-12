import { calculateStreak } from "../helpers/calculations";
import { getUser } from "../../auth/user";
import { query } from "../../_generated/server";
import { v } from "convex/values";

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
  args: {},
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
  args: {},
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
