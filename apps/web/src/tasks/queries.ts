import { api } from "@convex/api";
import { toTimeblockId } from "@/lib/convexTypes";
import { useQuery } from "convex/react";
import { useTasksContext } from "@/tasks/components/TasksContext";

export const useTasks = () => {
  const { timeblockId, tasks: contextTasks } = useTasksContext();

  const queryResult = useQuery(
    api.tasks.queries.list,
    timeblockId && contextTasks === undefined
      ? { timeblockId: toTimeblockId(timeblockId) }
      : "skip",
  );

  if (contextTasks !== undefined) {
    return {
      isLoading: false,
      tasks: contextTasks,
      canViewTasks: true,
      isOwner: true,
    };
  }

  return {
    isLoading: queryResult === undefined,
    tasks: queryResult?.tasks || [],
    canViewTasks: queryResult?.canView || false,
    isOwner: queryResult?.isOwner || false,
  };
};
