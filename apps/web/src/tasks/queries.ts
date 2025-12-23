import { api } from "@convex/api";
import { toTimeblockId } from "@/lib/convexTypes";
import { useQuery } from "convex/react";
import { useTasksContext } from "@/tasks/components/TasksContext";

export const useTasks = () => {
  const { timeblockId } = useTasksContext();

  const queryResult = useQuery(
    api.tasks.queries.list,
    timeblockId ? { timeblockId: toTimeblockId(timeblockId) } : "skip",
  );

  return {
    isLoading: queryResult === undefined,
    tasks: queryResult?.tasks || [],
    canViewTasks: queryResult?.canView || false,
    isOwner: queryResult?.isOwner || false,
  };
};
