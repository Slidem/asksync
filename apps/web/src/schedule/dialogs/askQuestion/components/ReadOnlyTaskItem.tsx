"use client";

import { CheckCircle2, Circle } from "lucide-react";

import { Doc } from "@convex/dataModel";
import { cn } from "@/lib/utils";

interface ReadOnlyTaskItemProps {
  task: Doc<"tasks">;
}

export const ReadOnlyTaskItem = ({ task }: ReadOnlyTaskItemProps) => {
  const formattedDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 py-2",
        task.completed && "opacity-60",
      )}
    >
      {/* Completion indicator */}
      <div className="mt-0.5 shrink-0">
        {task.completed ? (
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Circle className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            "text-sm",
            task.completed && "line-through text-muted-foreground",
          )}
        >
          {task.title}
        </div>

        {/* Metadata */}
        <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
          <span>Created {formattedDate(task.createdAt)}</span>
          {task.completedAt && (
            <span>Completed {formattedDate(task.completedAt)}</span>
          )}
        </div>
      </div>

      {/* Currently working on badge */}
      {task.currentlyWorkingOn && (
        <span className="text-xs text-primary font-medium shrink-0 bg-primary/10 px-2 py-0.5 rounded">
          Working on
        </span>
      )}
    </div>
  );
};
