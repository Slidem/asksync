"use client";

import {
  AlertCircle,
  Clock,
  Play,
  Plus,
  Square,
  Target,
  Trash2,
} from "lucide-react";
import { Doc, Id } from "@/../../backend/convex/_generated/dataModel";
import { memo, useCallback, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/../../backend/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useCurrentTimeblock } from "@/work/hooks/useCurrentTimeblock";
import { useMutation } from "convex/react";
import { useWorkModeStore } from "@/work/stores/workModeStore";

/**
 * Panel showing current timeblock and task focus
 */
export const CurrentFocusPanel = memo(function CurrentFocusPanel() {
  const { timeblockData, isLoading } = useCurrentTimeblock();
  const activeSessionId = useWorkModeStore((state) => state.activeSessionId);
  const currentTaskId = useWorkModeStore((state) => state.currentTaskId);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);

  const updateProgress = useMutation(
    api.workSessions.mutations.updateSessionProgress,
  );
  const updateTask = useMutation(api.tasks.mutations.update);
  const createTask = useMutation(api.tasks.mutations.create);
  const deleteTask = useMutation(api.tasks.mutations.remove);

  const handleTaskSelect = useCallback(
    async (taskId: Id<"tasks">) => {
      if (!activeSessionId) return;

      await updateProgress({
        sessionId: activeSessionId,
        taskId,
        timeblockId: timeblockData?.timeblock._id,
      });

      useWorkModeStore.setState({ currentTaskId: taskId });
    },
    [activeSessionId, timeblockData?.timeblock._id, updateProgress],
  );

  const handleTaskComplete = useCallback(
    async (taskId: Id<"tasks">, completed: boolean) => {
      await updateTask({
        id: taskId,
        completed,
      });

      if (completed && activeSessionId) {
        await updateProgress({
          sessionId: activeSessionId,
          completedTaskId: taskId,
        });
      }
    },
    [activeSessionId, updateProgress, updateTask],
  );

  const handleTaskWorkingOn = useCallback(
    async (taskId: Id<"tasks">, isCurrentlyWorkingOn: boolean) => {
      // If task is not currently being worked on, we want to set it as working
      if (!isCurrentlyWorkingOn && timeblockData) {
        // First clear any other "working on" tasks
        const otherWorkingTasks = timeblockData.tasks.filter(
          (t) => t.currentlyWorkingOn && t._id !== taskId,
        );
        for (const task of otherWorkingTasks) {
          await updateTask({
            id: task._id,
            currentlyWorkingOn: false,
          });
        }
      }

      // Toggle the working on state
      await updateTask({
        id: taskId,
        currentlyWorkingOn: !isCurrentlyWorkingOn,
      });

      // Set as current task in session if starting to work on it
      if (!isCurrentlyWorkingOn) {
        handleTaskSelect(taskId);
      }
    },
    [timeblockData, updateTask, handleTaskSelect],
  );

  const handleAddTask = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTaskTitle.trim() || !timeblockData) return;

      await createTask({
        timeblockId: timeblockData.timeblock._id,
        title: newTaskTitle.trim(),
      });

      setNewTaskTitle("");
      setIsAddingTask(false);
    },
    [newTaskTitle, timeblockData, createTask],
  );

  const handleDeleteTask = useCallback(
    async (taskId: Id<"tasks">) => {
      await deleteTask({ id: taskId });

      // Clear current task if it was deleted
      if (taskId === currentTaskId) {
        useWorkModeStore.setState({ currentTaskId: null });
      }
    },
    [deleteTask, currentTaskId],
  );

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Target className="h-5 w-5" />
            Current Focus
          </h2>
        </div>
        <div className="flex-1 p-6">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!timeblockData) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Target className="h-5 w-5" />
            Current Focus
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No Active Timeblock</p>
            <p className="text-sm mt-1">
              Create a timeblock in your schedule to track tasks
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { timeblock, tasks } = timeblockData;
  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  // Separate completed and incomplete tasks
  const incompleteTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Target className="h-5 w-5" />
            Current Focus
          </h2>
          <Badge variant="secondary">
            {completedCount}/{tasks.length} done
          </Badge>
        </div>

        {/* Timeblock Info */}
        <div className="p-3 bg-muted rounded-lg">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold">{timeblock.title}</h3>
              {timeblock.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {timeblock.description}
                </p>
              )}
            </div>
            <Badge variant="outline" className="ml-2">
              <Clock className="h-3 w-3 mr-1" />
              {formatTime(timeblock.startTime)} -{" "}
              {formatTime(timeblock.endTime)}
            </Badge>
          </div>

          {/* Progress Bar */}
          {tasks.length > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-muted-foreground/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col overflow-hidden">
        {/* Tasks List */}
        <div className="flex-1 flex flex-col">
          <h4 className="text-sm font-medium mb-4">Tasks</h4>

          <ScrollArea className="flex-1 -mx-2">
            <div className="px-2">
              {/* Show empty state only if no tasks at all */}
              {tasks.length === 0 && !isAddingTask ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-sm">
                  <div className="mb-4">No tasks yet</div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddingTask(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add first task
                  </Button>
                </div>
              ) : (
                <>
                  {/* Incomplete tasks with proper spacing */}
                  <div className="space-y-2">
                    {incompleteTasks.map((task) => (
                      <EditableTaskItem
                        key={task._id}
                        task={task}
                        isActive={task._id === currentTaskId}
                        isWorkingOn={task.currentlyWorkingOn}
                        onComplete={(completed) =>
                          handleTaskComplete(task._id, completed)
                        }
                        onWorkingOn={() =>
                          handleTaskWorkingOn(task._id, task.currentlyWorkingOn)
                        }
                        onUpdateTitle={(title) =>
                          updateTask({ id: task._id, title })
                        }
                        onDelete={() => handleDeleteTask(task._id)}
                        disabled={!activeSessionId}
                      />
                    ))}

                    {/* Add new task input - only show if under limit */}
                    {tasks.length < 20 && (
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 transition-colors">
                        <Checkbox disabled className="invisible" />
                        {isAddingTask ? (
                          <form onSubmit={handleAddTask} className="flex-1">
                            <Input
                              value={newTaskTitle}
                              onChange={(e) => setNewTaskTitle(e.target.value)}
                              placeholder="Enter task title and press Enter..."
                              className="h-7 text-sm border-0 p-0 focus-visible:ring-0"
                              // eslint-disable-next-line jsx-a11y/no-autofocus
                              autoFocus
                              onBlur={() => {
                                if (!newTaskTitle.trim()) {
                                  setIsAddingTask(false);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Escape") {
                                  setNewTaskTitle("");
                                  setIsAddingTask(false);
                                }
                              }}
                            />
                          </form>
                        ) : (
                          <button
                            onClick={() => setIsAddingTask(true)}
                            className="flex-1 text-left text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Plus className="inline h-3 w-3 mr-2" />
                            Add a new task...
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Completed tasks section with divider */}
              {completedTasks.length > 0 && (
                <>
                  {incompleteTasks.length > 0 && (
                    <div className="flex items-center gap-2 mt-6 mb-3">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-muted-foreground px-2">
                        Completed
                      </span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                  )}
                  <div className="space-y-2">
                    {completedTasks.map((task) => (
                      <EditableTaskItem
                        key={task._id}
                        task={task}
                        isActive={false}
                        isWorkingOn={false}
                        onComplete={(completed) =>
                          handleTaskComplete(task._id, completed)
                        }
                        onWorkingOn={() => {}}
                        onUpdateTitle={(title) =>
                          updateTask({ id: task._id, title })
                        }
                        onDelete={() => handleDeleteTask(task._id)}
                        disabled={false}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
});

/**
 * Editable task item component with inline editing
 */
const EditableTaskItem = memo(function EditableTaskItem({
  task,
  isActive,
  isWorkingOn,
  onComplete,
  onWorkingOn,
  onUpdateTitle,
  onDelete,
  disabled,
}: {
  task: Doc<"tasks">;
  isActive: boolean;
  isWorkingOn: boolean;
  onComplete: (completed: boolean) => void;
  onWorkingOn: () => void;
  onUpdateTitle: (title: string) => void;
  onDelete: () => void;
  disabled: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);

  const handleSaveEdit = () => {
    if (editValue.trim() && editValue !== task.title) {
      onUpdateTitle(editValue.trim());
    } else {
      setEditValue(task.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      setEditValue(task.title);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg transition-all group relative",
        "border bg-background/50",
        isActive && "bg-primary/5 border-primary/30 shadow-sm",
        !isActive && "hover:bg-muted/50 border-border",
        task.completed && "opacity-60",
      )}
    >
      {/* Checkbox */}
      <Checkbox
        checked={task.completed}
        onCheckedChange={onComplete}
        className="mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />

      {/* Task Title */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={handleKeyDown}
            className="h-7 text-sm"
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
          />
        ) : (
          <div className="flex items-start gap-2">
            <button
              className={cn(
                "text-left text-sm leading-relaxed",
                task.completed && "line-through text-muted-foreground",
              )}
              onClick={() => {
                if (!task.completed) {
                  setIsEditing(true);
                }
              }}
              disabled={task.completed}
            >
              {task.title}
            </button>
          </div>
        )}
      </div>

      {/* Action buttons container */}
      <div className="flex items-center gap-1">
        {isWorkingOn && !task.completed && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onWorkingOn();
            }}
            variant="default"
            size="sm"
            className="text-xs h-7 w-fit"
          >
            <Square className="h-2 w-2 mr-1 fill-current" />
            Active
          </Button>
        )}

        {!task.completed && !isWorkingOn && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onWorkingOn();
            }}
            disabled={disabled}
            className={cn(
              "text-xs h-7 w-fit",
              "opacity-0 group-hover:opacity-100 transition-opacity",
              "hover:bg-primary/10 hover:text-primary",
            )}
          >
            <Play className="h-3 w-3 mr-1" />
            Work on
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className={cn(
            "h-7 w-7",
            "opacity-0 group-hover:opacity-100 transition-opacity",
            "hover:bg-destructive/10 hover:text-destructive",
          )}
          style={{ position: "relative", zIndex: 10 }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
});

// Helper function to format time
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
