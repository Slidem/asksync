import { Id } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";

/**
 * Clear the "currently working on" flag from all tasks in a timeblock,
 * optionally excluding a specific task
 */
export async function clearOtherWorkingTasks(
  ctx: MutationCtx,
  timeblockId: Id<"timeblocks">,
  exceptTaskId?: Id<"tasks">,
) {
  const allTasks = await ctx.db
    .query("tasks")
    .withIndex("by_timeblock", (q) => q.eq("timeblockId", timeblockId))
    .collect();

  for (const task of allTasks) {
    if (task._id !== exceptTaskId && task.currentlyWorkingOn) {
      await ctx.db.patch(task._id, { currentlyWorkingOn: false });
    }
  }
}
