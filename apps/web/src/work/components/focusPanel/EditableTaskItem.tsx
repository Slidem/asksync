"use client";

import { Play, Square, Trash2 } from "lucide-react";
import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { TaskItemProps } from "./types";

export const EditableTaskItem = memo(function EditableTaskItem({
  task,
  isActive,
  isWorkingOn,
  onComplete,
  onWorkingOn,
  onUpdateTitle,
  onDelete,
  disabled,
}: TaskItemProps) {
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
