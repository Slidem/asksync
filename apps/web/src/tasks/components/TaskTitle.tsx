import React, { useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTasksContext } from "@/tasks/components/TasksContext";

interface Props {
  id: string;
  title: string;
  isCompleted: boolean;
}

export const TaskTitle = ({ id, title, isCompleted }: Props) => {
  const { isReadOnly, onTaskEdited } = useTasksContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef: React.RefObject<HTMLInputElement | null> = useRef(null);

  const handleSaveEdit = () => {
    if (editValue.trim() && editValue !== title && onTaskEdited) {
      onTaskEdited(id, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      setEditValue(title);
      setIsEditing(false);
    }
  };

  const handleClickEdit = () => {
    if (!isCompleted) {
      setIsEditing(true);
      setTimeout(() => {
        inputRef?.current?.focus();
      }, 0);
    }
  };

  return (
    <div className="flex-1 min-w-0">
      {isEditing && !isReadOnly ? (
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSaveEdit}
          onKeyDown={handleKeyDown}
          className="h-7 text-sm"
        />
      ) : (
        <div className="flex items-start gap-2">
          <button
            className={cn(
              "text-left text-sm leading-relaxed",
              isCompleted && "line-through text-muted-foreground",
            )}
            onClick={handleClickEdit}
            disabled={isCompleted}
          >
            {title}
          </button>
        </div>
      )}
    </div>
  );
};
