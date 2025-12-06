import { v } from "convex/values";
import { query } from "../../_generated/server";
import { getUser } from "../../auth/user";

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
