"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Circle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Doc } from "@convex/api";

interface ChecklistItemProps {
  task: Doc<"tasks">;
  isOwner: boolean;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onUpdateTitle: (taskId: string, title: string) => void;
  onToggleWorkingOn: (taskId: string, currentlyWorkingOn: boolean) => void;
  onDelete: (taskId: string) => void;
}

export const ChecklistItem = ({
  task,
  isOwner,
  onToggleComplete,
  onUpdateTitle,
  onToggleWorkingOn,
  onDelete,
}: ChecklistItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);

  const handleSaveEdit = () => {
    if (editValue.trim() && editValue !== task.title) {
      onUpdateTitle(task._id, editValue.trim());
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
        "flex items-center gap-3 p-3 border rounded-lg group",
        task.completed && "bg-muted/50",
      )}
    >
      {/* Checkbox */}
      {isOwner ? (
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggleComplete(task._id, task.completed)}
          className="mt-0.5"
        />
      ) : (
        <div className="mt-0.5">
          {task.completed ? (
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Circle className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      )}

      {/* Title */}
      <div className="flex-1 min-w-0">
        {isOwner && isEditing ? (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={handleKeyDown}
            autoFocus
            className="h-8"
          />
        ) : (
          <div
            className={cn(
              "cursor-text",
              task.completed && "line-through text-muted-foreground",
            )}
            onClick={() => isOwner && setIsEditing(true)}
          >
            {task.title}
          </div>
        )}

        {/* Timestamps */}
        <div className="flex gap-3 text-xs text-muted-foreground mt-1">
          <span>Created {formattedDate(task.createdAt)}</span>
          {task.completedAt && (
            <span>Completed {formattedDate(task.completedAt)}</span>
          )}
        </div>
      </div>

      {/* Working on indicator */}
      {isOwner && (
        <Button
          variant={task.currentlyWorkingOn ? "default" : "ghost"}
          size="sm"
          onClick={() =>
            onToggleWorkingOn(task._id, task.currentlyWorkingOn)
          }
          className="shrink-0"
        >
          {task.currentlyWorkingOn ? "Working on" : "Work on"}
        </Button>
      )}

      {!isOwner && task.currentlyWorkingOn && (
        <span className="text-xs text-primary font-medium shrink-0">
          Currently working on
        </span>
      )}

      {/* Delete button */}
      {isOwner && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(task._id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
