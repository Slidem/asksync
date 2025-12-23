"use client";

import { useCallback, useEffect, useMemo } from "react";

import { DraftTask } from "@/schedule/dialogs/eventDialog/eventDialogStore";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Task } from "@/tasks/model";
import { TasksList } from "@/tasks/components/TasksList";
import { TasksListProvider } from "@/tasks/components/TasksContext";
import { api } from "@convex/api";
import { toTimeblockId } from "@/lib/convexTypes";
import { useEventDialogStore } from "@/schedule/dialogs/eventDialog/eventDialogStore";
import { useQuery } from "convex/react";
import { useShallow } from "zustand/react/shallow";

const draftToTask = (draft: DraftTask): Task => ({
  id: draft.id,
  orgId: "",
  title: draft.title,
  completed: draft.completed,
  currentlyWorkingOn: draft.currentlyWorkingOn,
  order: draft.order,
  createdBy: "",
  createdAt: Date.now(),
});

export const EventTasksTab = () => {
  const {
    eventId,
    checklistsVisible,
    draftTasks,
    setFormFields,
    addDraftTask,
    updateDraftTask,
    removeDraftTask,
  } = useEventDialogStore(
    useShallow((state) => ({
      eventId: state.eventMetadata.eventId,
      checklistsVisible: state.formFields.checklistsVisible,
      draftTasks: state.formFields.draftTasks,
      setFormFields: state.setFormFields,
      addDraftTask: state.addDraftTask,
      updateDraftTask: state.updateDraftTask,
      removeDraftTask: state.removeDraftTask,
    })),
  );

  const tasksData = useQuery(
    api.tasks.queries.list,
    eventId ? { timeblockId: toTimeblockId(eventId) } : "skip",
  );

  useEffect(() => {
    if (tasksData?.tasks && eventId && draftTasks.length === 0) {
      setFormFields({
        draftTasks: tasksData.tasks.map((task) => ({
          id: task._id,
          title: task.title,
          completed: task.completed,
          order: task.order,
          currentlyWorkingOn: task.currentlyWorkingOn,
        })),
      });
    }
  }, [tasksData, eventId, draftTasks.length, setFormFields]);

  const tasks = useMemo(() => draftTasks.map(draftToTask), [draftTasks]);
  const incompleteTasks = useMemo(
    () => tasks.filter((t) => !t.completed),
    [tasks],
  );
  const completedTasks = useMemo(
    () => tasks.filter((t) => t.completed),
    [tasks],
  );

  const handleTaskAdded = useCallback(
    (title: string) => {
      addDraftTask(title);
    },
    [addDraftTask],
  );

  const handleTaskRemoved = useCallback(
    (id: string) => {
      removeDraftTask(id);
    },
    [removeDraftTask],
  );

  const handleTaskEdited = useCallback(
    (id: string, title: string) => {
      updateDraftTask(id, { title });
    },
    [updateDraftTask],
  );

  const handleTaskCompleted = useCallback(
    (id: string, completed: boolean) => {
      updateDraftTask(id, { completed });
    },
    [updateDraftTask],
  );

  const handleTaskActiveStateChanged = useCallback(
    (id: string, isCurrentlyWorkingOn: boolean) => {
      updateDraftTask(id, { currentlyWorkingOn: isCurrentlyWorkingOn });
    },
    [updateDraftTask],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 border rounded-lg">
        <div className="flex-1">
          <Label htmlFor="checklists-visible" className="font-medium">
            Make checklists visible to others
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            Allow people who can view this timeblock to see your tasks
          </p>
        </div>
        <Switch
          id="checklists-visible"
          checked={checklistsVisible}
          onCheckedChange={(checked) =>
            setFormFields({ checklistsVisible: checked })
          }
        />
      </div>

      <TasksListProvider
        timeblockId={eventId || ""}
        tasks={tasks}
        maxTasks={20}
        onTaskAdded={handleTaskAdded}
        onTaskRemoved={handleTaskRemoved}
        onTaskEdited={handleTaskEdited}
        onTaskCompleted={handleTaskCompleted}
        onTaskActiveStateChanged={handleTaskActiveStateChanged}
      >
        <TasksList
          incompleteTasks={incompleteTasks}
          completedTasks={completedTasks}
        />
      </TasksListProvider>

      {draftTasks.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {draftTasks.filter((t) => t.completed).length} of {draftTasks.length}{" "}
          completed
        </div>
      )}
    </div>
  );
};
