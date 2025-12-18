"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { EditableTaskItem } from "./EditableTaskItem";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TasksListProps } from "./types";

export function TasksList({
  tasks,
  incompleteTasks,
  completedTasks,
  currentTaskId,
  isAddingTask,
  newTaskTitle,
  activeSessionId,
  onTaskComplete,
  onTaskWorkingOn,
  onUpdateTask,
  onDeleteTask,
  onAddTask,
  onNewTaskTitleChange,
  onToggleAddingTask,
}: TasksListProps) {
  return (
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
                onClick={() => onToggleAddingTask(true)}
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
                      onTaskComplete(task._id, completed)
                    }
                    onWorkingOn={() =>
                      onTaskWorkingOn(task._id, task.currentlyWorkingOn)
                    }
                    onUpdateTitle={(title) => onUpdateTask(task._id, title)}
                    onDelete={() => onDeleteTask(task._id)}
                    disabled={!activeSessionId}
                  />
                ))}

                {/* Add new task input - only show if under limit */}
                {tasks.length < 20 && (
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 transition-colors">
                    <Checkbox disabled className="invisible" />
                    {isAddingTask ? (
                      <form onSubmit={onAddTask} className="flex-1">
                        <Input
                          value={newTaskTitle}
                          onChange={(e) => onNewTaskTitleChange(e.target.value)}
                          placeholder="Enter task title and press Enter..."
                          className="h-7 text-sm border-0 p-0 focus-visible:ring-0"
                          // eslint-disable-next-line jsx-a11y/no-autofocus
                          autoFocus
                          onBlur={() => {
                            if (!newTaskTitle.trim()) {
                              onToggleAddingTask(false);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") {
                              onNewTaskTitleChange("");
                              onToggleAddingTask(false);
                            }
                          }}
                        />
                      </form>
                    ) : (
                      <button
                        onClick={() => onToggleAddingTask(true)}
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
                      onTaskComplete(task._id, completed)
                    }
                    onWorkingOn={() => {}}
                    onUpdateTitle={(title) => onUpdateTask(task._id, title)}
                    onDelete={() => onDeleteTask(task._id)}
                    disabled={false}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
