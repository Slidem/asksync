import React, { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useTasks } from "../queries";
import { useTasksContext } from "@/tasks/components/TasksContext";

export const AddTaskInput = () => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const { maxTasks = 20, onTaskAdded } = useTasksContext();
  const { isLoading, tasks } = useTasks();
  const inputRef: React.RefObject<HTMLInputElement | null> = React.useRef(null);

  const handleTaskAdded = (e: React.FormEvent) => {
    e.preventDefault();
    if (onTaskAdded) {
      const title = newTaskTitle.trim();
      if (title) {
        onTaskAdded(title);
        setNewTaskTitle("");
        inputRef.current?.focus();
      }
    }
  };

  const handleNewTaskTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTaskTitle(e.target.value);
  };

  const handleToggleAddingTask = (adding: boolean) => {
    setIsAddingTask(adding);
    if (!adding) {
      setNewTaskTitle("");
    }
  };

  const handleKeyPressed = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      handleToggleAddingTask(false);
    }
  };

  const handleBlur = () => {
    if (!newTaskTitle.trim()) {
      handleToggleAddingTask(false);
    }
  };

  const handleAddTaskClick = () => {
    handleToggleAddingTask(true);
    setNewTaskTitle("");
  };

  useEffect(() => {
    if (isAddingTask) {
      inputRef?.current?.focus();
    }
  }, [isAddingTask]);

  if (isLoading || tasks.length >= maxTasks) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 transition-colors">
      {isAddingTask ? (
        <form onSubmit={handleTaskAdded} className="flex-1">
          <Input
            ref={inputRef}
            name="taskTitle"
            value={newTaskTitle}
            onChange={handleNewTaskTitleChange}
            placeholder="Enter task title and press Enter..."
            className="h-7 text-sm border-0 p-0 focus-visible:ring-0"
            onBlur={handleBlur}
            onKeyDown={handleKeyPressed}
          />
        </form>
      ) : (
        <button
          onClick={handleAddTaskClick}
          className="flex-1 text-left text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="inline h-3 w-3 mr-2" />
          Add a new task...
        </button>
      )}
    </div>
  );
};
