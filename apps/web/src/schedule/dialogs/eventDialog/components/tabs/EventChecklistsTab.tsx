"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { ChecklistItem } from "../ChecklistItem";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { api } from "@convex/api";
import { toTimeblockId } from "@/lib/convexTypes";
import { useEventDialogStore } from "@/schedule/dialogs/eventDialog/eventDialogStore";
import { useQuery } from "convex/react";
import { useShallow } from "zustand/react/shallow";

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

  const [newTaskTitle, setNewTaskTitle] = useState("");

  // Load existing tasks when editing
  const tasksData = useQuery(
    api.tasks.queries.list,
    eventId ? { timeblockId: toTimeblockId(eventId) } : "skip",
  );

  // Initialize draftTasks from backend when editing
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

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    addDraftTask(newTaskTitle.trim());
    setNewTaskTitle("");
  };

  const handleToggleComplete = (taskId: string, completed: boolean) => {
    updateDraftTask(taskId, { completed: !completed });
  };

  const handleUpdateTitle = (taskId: string, title: string) => {
    updateDraftTask(taskId, { title });
  };

  const handleToggleWorkingOn = (
    taskId: string,
    currentlyWorkingOn: boolean,
  ) => {
    updateDraftTask(taskId, { currentlyWorkingOn: !currentlyWorkingOn });
  };

  const handleDelete = (taskId: string) => {
    removeDraftTask(taskId);
  };

  // Owner view
  return (
    <div className="space-y-4">
      {/* Visibility toggle */}
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

      {/* Add task input */}
      <div className="flex gap-2">
        <Input
          placeholder="Add a task..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddTask();
            }
          }}
          disabled={draftTasks.length >= 20}
        />
        <Button
          onClick={handleAddTask}
          disabled={!newTaskTitle.trim() || draftTasks.length >= 20}
          size="icon"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {draftTasks.length >= 20 && (
        <p className="text-sm text-muted-foreground">
          Maximum 20 tasks per timeblock
        </p>
      )}

      {/* Task list */}
      {draftTasks.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No tasks yet. Add one above to get started.
        </div>
      ) : (
        <div className="space-y-2">
          {draftTasks.map((task) => (
            <ChecklistItem
              key={task.id}
              task={task}
              isOwner={true}
              onToggleComplete={handleToggleComplete}
              onUpdateTitle={handleUpdateTitle}
              onToggleWorkingOn={handleToggleWorkingOn}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Stats */}
      {draftTasks.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {draftTasks.filter((t) => t.completed).length} of {draftTasks.length}{" "}
          completed
        </div>
      )}
    </div>
  );
};
