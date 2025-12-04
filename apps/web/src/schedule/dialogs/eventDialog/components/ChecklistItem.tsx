"use client";

import { CheckCircle2, Circle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DraftTask } from "@/schedule/dialogs/eventDialog/eventDialogStore";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ChecklistItemProps {
  task: DraftTask;
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
      onUpdateTitle(task.id, editValue.trim());
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
        "flex items-center gap-3 p-3 border rounded-lg group",
        task.completed && "bg-muted/50",
      )}
    >
      {/* Checkbox */}
      {isOwner ? (
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggleComplete(task.id, task.completed)}
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
            className="h-8"
          />
        ) : (
          <div
            className={cn(
              "cursor-text",
              task.completed && "line-through text-muted-foreground",
            )}
            onClick={() => isOwner && setIsEditing(true)}
            onKeyDown={(e) => {
              if (isOwner && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                setIsEditing(true);
              }
            }}
            role={isOwner ? "button" : undefined}
            tabIndex={isOwner ? 0 : undefined}
          >
            {task.title}
          </div>
        )}
      </div>

      {/* Working on indicator */}
      {isOwner && (
        <Button
          variant={task.currentlyWorkingOn ? "default" : "ghost"}
          size="sm"
          onClick={() => onToggleWorkingOn(task.id, task.currentlyWorkingOn)}
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
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
