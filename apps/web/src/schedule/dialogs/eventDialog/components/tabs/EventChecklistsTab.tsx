"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { api } from "@convex/api";
import { toTimeblockId } from "@/lib/convexTypes";
import { useEventDialogStore } from "@/schedule/dialogs/eventDialog/eventDialogStore";
import { useMutation, useQuery } from "convex/react";
import { useShallow } from "zustand/react/shallow";
import { ChecklistItem } from "../ChecklistItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const EventChecklistsTab = () => {
  const { eventId, checklistsVisible, setFormFields } = useEventDialogStore(
    useShallow((state) => ({
      eventId: state.eventMetadata.eventId,
      checklistsVisible: state.formFields.checklistsVisible,
      setFormFields: state.setFormFields,
    })),
  );

  const [newTaskTitle, setNewTaskTitle] = useState("");

  // Query tasks
  const tasksData = useQuery(
    api.tasks.queries.list,
    eventId ? { timeblockId: toTimeblockId(eventId) } : "skip",
  );

  // Mutations
  const createTaskMutation = useMutation(api.tasks.mutations.create);
  const updateTaskMutation = useMutation(api.tasks.mutations.update);
  const deleteTaskMutation = useMutation(api.tasks.mutations.remove);
  const reorderTasksMutation = useMutation(api.tasks.mutations.reorder);

  const isOwner = tasksData?.isOwner ?? false;
  const canView = tasksData?.canView ?? false;
  const tasks = tasksData?.tasks ?? [];

  const handleAddTask = async () => {
    if (!eventId || !newTaskTitle.trim()) return;

    try {
      await createTaskMutation({
        timeblockId: toTimeblockId(eventId),
        title: newTaskTitle.trim(),
      });
      setNewTaskTitle("");
      toast.success("Task added");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add task",
      );
    }
  };

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    try {
      await updateTaskMutation({
        id: taskId as any,
        completed: !completed,
      });
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const handleUpdateTitle = async (taskId: string, title: string) => {
    try {
      await updateTaskMutation({
        id: taskId as any,
        title,
      });
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const handleToggleWorkingOn = async (
    taskId: string,
    currentlyWorkingOn: boolean,
  ) => {
    try {
      await updateTaskMutation({
        id: taskId as any,
        currentlyWorkingOn: !currentlyWorkingOn,
      });
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTaskMutation({ id: taskId as any });
      toast.success("Task deleted");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  // Only show for existing events
  if (!eventId) {
    return (
      <div className="text-sm text-muted-foreground">
        Save the timeblock first to add checklists
      </div>
    );
  }

  // Non-owner view
  if (!isOwner) {
    if (!canView || tasks.length === 0) {
      return (
        <div className="text-sm text-muted-foreground">
          Checklists are private to the owner
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Read-only view of owner's checklist
        </div>
        <div className="space-y-2">
          {tasks.map((task) => (
            <ChecklistItem
              key={task._id}
              task={task}
              isOwner={false}
              onToggleComplete={() => {}}
              onUpdateTitle={() => {}}
              onToggleWorkingOn={() => {}}
              onDelete={() => {}}
            />
          ))}
        </div>
      </div>
    );
  }

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
          disabled={tasks.length >= 20}
        />
        <Button
          onClick={handleAddTask}
          disabled={!newTaskTitle.trim() || tasks.length >= 20}
          size="icon"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {tasks.length >= 20 && (
        <p className="text-sm text-muted-foreground">
          Maximum 20 tasks per timeblock
        </p>
      )}

      {/* Task list */}
      {tasks.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No tasks yet. Add one above to get started.
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <ChecklistItem
              key={task._id}
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
      {tasks.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {tasks.filter((t) => t.completed).length} of {tasks.length} completed
        </div>
      )}
    </div>
  );
};
