import React, { useCallback, useMemo } from "react";

import { Id } from "@convex/dataModel";
import { Task } from "@/tasks/model";
import { TasksList } from "@/tasks/components/TasksList";
import { TasksListProvider } from "@/tasks/components/TasksContext";
import { api } from "@convex/api";
import { useCurrentTimeblock } from "@/work/hooks/useCurrentTimeblock";
import { useMutation } from "convex/react";
import { useWorkModeStore } from "@/work/stores/workModeStore";

export const FocusPanelTasks = () => {
  const activeSessionId = useWorkModeStore((state) => state.activeSessionId);
  const createTask = useMutation(api.tasks.mutations.create);
  const deleteTask = useMutation(api.tasks.mutations.remove);
  const updateTask = useMutation(api.tasks.mutations.update);
  const updateProgress = useMutation(
    api.workSessions.mutations.progress.updateSessionProgress,
  );

  const { timeblockData, isLoading } = useCurrentTimeblock();

  const { tasks = [] } = timeblockData || {};

  const { completed, incomplete } = useMemo(
    () =>
      tasks.reduce(
        (acc, t) => {
          const task: Task = {
            id: t._id,
            orgId: t.orgId,
            timeblockId: t.timeblockId,
            order: t.order,
            title: t.title,
            completed: t.completed,
            currentlyWorkingOn: t.currentlyWorkingOn,
            createdBy: t.createdBy,
            createdAt: t.createdAt,
            completedAt: t.completedAt,
          };

          if (t.completed) {
            acc.completed.push(task);
          } else {
            acc.incomplete.push(task);
          }
          return acc;
        },
        { completed: [] as Task[], incomplete: [] as Task[] },
      ),
    [tasks],
  );

  /**
   * Note: we currently take the first timeblock only;
   * In the future, we might want to handle multiple timeblocks here
   * We should consider adding a "focused" timeblock concept, and always have a single timeblock selected
   */
  const currentTimeblock = timeblockData?.timeblocks[0];

  const handleTaskAdded = useCallback(
    async (title: string) => {
      if (!title.trim() || !currentTimeblock) return;

      await createTask({
        timeblockId: currentTimeblock._id,
        title: title.trim(),
      });
    },
    [createTask, currentTimeblock],
  );

  const handleTaskRemoved = useCallback(
    async (taskId: string) => {
      await deleteTask({ id: taskId as Id<"tasks"> });
    },
    [deleteTask],
  );

  const handleTaskEdited = useCallback(
    async (taskId: string, title: string) => {
      await updateTask({ id: taskId as Id<"tasks">, title });
    },
    [updateTask],
  );

  const handleTaskCompleted = useCallback(
    async (taskId: string, completed: boolean) => {
      const id = taskId as Id<"tasks">;
      await updateTask({
        id,
        completed,
        currentlyWorkingOn: false,
      });

      if (!activeSessionId) return;
      if (completed) {
        await updateProgress({
          sessionId: activeSessionId,
          completedTaskId: id,
        });
      } else {
        await updateProgress({
          sessionId: activeSessionId,
          uncompletedTaskId: id,
        });
      }
    },
    [updateTask, activeSessionId, updateProgress],
  );

  const handleTaskActiveStateChanged = useCallback(
    async (taskId: string, isCurrentlyWorkingOn: boolean) => {
      const id = taskId as Id<"tasks">;

      await updateTask({
        id,
        currentlyWorkingOn: isCurrentlyWorkingOn,
      });

      if (!activeSessionId || !currentTimeblock) return;

      await updateProgress({
        sessionId: activeSessionId,
        currentlyWorkingOnTaskId: isCurrentlyWorkingOn ? id : null,
        timeblockId: currentTimeblock._id,
      });
    },
    [activeSessionId, currentTimeblock, updateProgress, updateTask],
  );

  if (isLoading || !timeblockData) {
    return null;
  }

  return (
    <TasksListProvider
      timeblockId={currentTimeblock?._id || ""}
      isReadOnly={false}
      maxTasks={20}
      onTaskAdded={handleTaskAdded}
      onTaskRemoved={handleTaskRemoved}
      onTaskEdited={handleTaskEdited}
      onTaskCompleted={handleTaskCompleted}
      onTaskActiveStateChanged={handleTaskActiveStateChanged}
    >
      <TasksList incompleteTasks={incomplete} completedTasks={completed} />
    </TasksListProvider>
  );
};
