import { ConvexError, v } from "convex/values";
import { mutation } from "../../_generated/server";
import { getUser } from "../../auth/user";

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
