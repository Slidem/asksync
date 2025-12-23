import { Button } from "@/components/ui/button";
import React from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTasksContext } from "@/tasks/components/TasksContext";

interface Props {
  id: string;
}

export const TaskDeleteButton: React.FC<Props> = ({ id }) => {
  const { isReadOnly, onTaskRemoved } = useTasksContext();

  if (isReadOnly || !onTaskRemoved) {
    return null;
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTaskRemoved(id);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      className={cn(
        "h-7 w-7",
        "opacity-0 group-hover:opacity-100 transition-opacity",
        "hover:bg-destructive/10 hover:text-destructive",
      )}
      style={{ position: "relative", zIndex: 10 }}
    >
      <Trash2 className="h-3 w-3" />
    </Button>
  );
};
