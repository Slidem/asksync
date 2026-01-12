/* eslint-disable import/order */
import { getUser } from "../../auth/user";
import { query } from "../../_generated/server";
import { v } from "convex/values";

export const getActiveSessionId = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) return { activeSessionId: null };

    let session = await ctx.db
      .query("workSessions")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", user.id).eq("status", "active"),
      )
      .first();

    if (!session) {
      session = await ctx.db
        .query("workSessions")
        .withIndex("by_user_and_status", (q) =>
          q.eq("userId", user.id).eq("status", "paused"),
        )
        .first();
    }

    return {
      activeSessionId: session ? session._id : null,
    };
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

// Get sessions grouped by focus mode
export const getSessionsByFocusMode = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) return [];

    const days = args.days ?? 30;
    const startDate = Date.now() - days * 24 * 60 * 60 * 1000;

    const sessions = await ctx.db
      .query("workSessions")
      .withIndex("by_user_and_org", (q) =>
        q.eq("userId", user.id).eq("orgId", user.orgId),
      )
      .filter((q) =>
        q.and(
          q.gte(q.field("startedAt"), startDate),
          q.eq(q.field("status"), "completed"),
          q.eq(q.field("sessionType"), "work"),
        ),
      )
      .collect();

    const focusModeStats = new Map<
      string,
      { count: number; totalTime: number }
    >();

    sessions.forEach((session) => {
      const mode = session.focusMode;
      if (!focusModeStats.has(mode)) {
        focusModeStats.set(mode, { count: 0, totalTime: 0 });
      }
      const stats = focusModeStats.get(mode)!;
      stats.count++;
      stats.totalTime += session.actualDuration;
    });

    return Array.from(focusModeStats.entries()).map(([mode, stats]) => ({
      mode,
      count: stats.count,
      totalTime: stats.totalTime,
    }));
  },
});

// Get productivity metrics
export const getProductivityMetrics = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) return null;

    const days = args.days ?? 30;
    const startDate = Date.now() - days * 24 * 60 * 60 * 1000;

    const sessions = await ctx.db
      .query("workSessions")
      .withIndex("by_user_and_org", (q) =>
        q.eq("userId", user.id).eq("orgId", user.orgId),
      )
      .filter((q) => q.gte(q.field("startedAt"), startDate))
      .collect();

    const completedSessions = sessions.filter((s) => s.status === "completed");
    const skippedSessions = sessions.filter((s) => s.status === "skipped");
    const workSessions = completedSessions.filter(
      (s) => s.sessionType === "work",
    );

    // Calculate average session length
    const avgSessionLength =
      workSessions.length > 0
        ? workSessions.reduce((sum, s) => sum + s.actualDuration, 0) /
          workSessions.length
        : 0;

    // Calculate completion rate
    const totalAttempted = completedSessions.length + skippedSessions.length;
    const completionRate =
      totalAttempted > 0
        ? (completedSessions.length / totalAttempted) * 100
        : 0;

    // Calculate peak productivity hours
    const hourCounts = new Map<number, number>();
    workSessions.forEach((session) => {
      const hour = new Date(session.startedAt).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    const peakHours = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => hour);

    return {
      avgSessionLength: Math.round(avgSessionLength),
      completionRate: Math.round(completionRate),
      peakHours,
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      skippedSessions: skippedSessions.length,
    };
  },
});

// Get weekly stats for comparison
export const getWeeklyStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) return null;

    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;

    const allSessions = await ctx.db
      .query("workSessions")
      .withIndex("by_user_and_org", (q) =>
        q.eq("userId", user.id).eq("orgId", user.orgId),
      )
      .filter((q) => q.gte(q.field("startedAt"), twoWeeksAgo))
      .collect();

    const thisWeekSessions = allSessions.filter(
      (s) => s.startedAt >= oneWeekAgo && s.status === "completed",
    );
    const lastWeekSessions = allSessions.filter(
      (s) =>
        s.startedAt >= twoWeeksAgo &&
        s.startedAt < oneWeekAgo &&
        s.status === "completed",
    );

    const calculateWeekStats = (sessions: typeof allSessions) => {
      const workSessions = sessions.filter((s) => s.sessionType === "work");
      const totalTime = workSessions.reduce(
        (sum, s) => sum + s.actualDuration,
        0,
      );
      const tasksCompleted = sessions.reduce(
        (sum, s) => sum + s.tasksCompleted.length,
        0,
      );
      const questionsAnswered = sessions.reduce(
        (sum, s) => sum + s.questionsAnswered.length,
        0,
      );

      return {
        totalTime,
        sessions: sessions.length,
        tasksCompleted,
        questionsAnswered,
      };
    };

    const thisWeek = calculateWeekStats(thisWeekSessions);
    const lastWeek = calculateWeekStats(lastWeekSessions);

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return {
      thisWeek,
      lastWeek,
      changes: {
        totalTime: calculateChange(thisWeek.totalTime, lastWeek.totalTime),
        sessions: calculateChange(thisWeek.sessions, lastWeek.sessions),
        tasksCompleted: calculateChange(
          thisWeek.tasksCompleted,
          lastWeek.tasksCompleted,
        ),
        questionsAnswered: calculateChange(
          thisWeek.questionsAnswered,
          lastWeek.questionsAnswered,
        ),
      },
    };
  },
});
