import { ConvexError, v } from "convex/values";
import { mutation } from "../../_generated/server";
import { getUser } from "../../auth/user";
import { clearOtherWorkingTasks } from "../../tasks/helpers";

// Update session progress (tasks completed, current focus)
export const updateSessionProgress = mutation({
  args: {
    sessionId: v.id("workSessions"),
    taskId: v.optional(v.id("tasks")),
    questionId: v.optional(v.id("questions")),
    completedTaskId: v.optional(v.id("tasks")),
    uncompletedTaskId: v.optional(v.id("tasks")),
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
          // Clear other tasks' currentlyWorkingOn flag, except this one
          await clearOtherWorkingTasks(ctx, task.timeblockId, args.taskId);

          // Set this task as currently working on
          await ctx.db.patch(args.taskId, { currentlyWorkingOn: true });
        }
      }
    }

    // Update current question
    if (args.questionId !== undefined) {
      updates.questionId = args.questionId;
    }

    // Add completed task (ensure uniqueness)
    if (args.completedTaskId) {
      const existingTasks = new Set(session.tasksCompleted);
      existingTasks.add(args.completedTaskId);
      updates.tasksCompleted = Array.from(existingTasks);

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

    // Remove uncompleted task
    if (args.uncompletedTaskId) {
      updates.tasksCompleted = session.tasksCompleted.filter(
        (id) => id !== args.uncompletedTaskId,
      );

      // Mark task as not completed in tasks table
      const task = await ctx.db.get(args.uncompletedTaskId);
      if (task && task.orgId === user.orgId) {
        await ctx.db.patch(args.uncompletedTaskId, {
          completed: false,
          completedAt: undefined,
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
