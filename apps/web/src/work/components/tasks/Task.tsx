import { Checkbox } from "@/components/ui/checkbox";
import React from "react";
import { TaskActiveButton } from "@/work/components/tasks/TaskActiveButton";
import { TaskDeleteButton } from "@/work/components/tasks/TaskDeleteButton";
import { TaskTitle } from "@/work/components/tasks/TaskTitle";
import { cn } from "@/lib/utils";
import { useTasksContext } from "@/work/components/tasks/TasksContext";

interface Props {
  id: string;
  title: string;
  isCurrentlyWorkingOn: boolean;
  isCompleted: boolean;
}

export const Task: React.FC<Props> = ({
  id,
  title,
  isCurrentlyWorkingOn,
  isCompleted,
}) => {
  const { isReadOnly, onTaskCompleted } = useTasksContext();

  const handleTaskCompleted = (completed: boolean) => {
    if (!isReadOnly && onTaskCompleted) {
      onTaskCompleted(id, completed);
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg transition-all group relative",
        "border bg-background/50",
        isCurrentlyWorkingOn && "bg-primary/5 border-primary/30 shadow-sm",
        !isCurrentlyWorkingOn && "hover:bg-muted/50 border-border",
        isCompleted && "opacity-60",
      )}
    >
      <Checkbox
        checked={isCompleted}
        onCheckedChange={handleTaskCompleted}
        className="mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />
      <TaskTitle id={id} title={title} isCompleted={isCompleted} />

      <div className="flex items-center gap-1">
        <TaskActiveButton
          id={id}
          isCompleted={isCompleted}
          isCurrentlyWorkingOn={isCurrentlyWorkingOn}
        />
        <TaskDeleteButton id={id} />
      </div>
    </div>
  );
};
