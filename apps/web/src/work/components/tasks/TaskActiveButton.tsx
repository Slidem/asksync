import { Play, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import React from "react";
import { cn } from "@/lib/utils";
import { useTasksContext } from "@/work/components/tasks/TasksContext";

interface Props {
  id: string;
  isCurrentlyWorkingOn: boolean;
  isCompleted: boolean;
}

export const TaskActiveButton: React.FC<Props> = ({
  id,
  isCurrentlyWorkingOn,
  isCompleted,
}) => {
  const { isReadOnly, onTaskActiveStateChanged } = useTasksContext();

  const handleStopWorkingOn = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTaskActiveStateChanged) {
      onTaskActiveStateChanged(id, false);
    }
  };

  const handleStartWorkingOn = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTaskActiveStateChanged) {
      onTaskActiveStateChanged(id, true);
    }
  };

  return (
    <>
      {isCurrentlyWorkingOn && !isCompleted && (
        <Button
          onClick={handleStopWorkingOn}
          disabled={isReadOnly}
          variant="default"
          size="sm"
          className="text-xs h-7 w-fit"
        >
          <Square className="h-2 w-2 mr-1 fill-current" />
          Active
        </Button>
      )}

      {!isReadOnly && !isCompleted && !isCurrentlyWorkingOn && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleStartWorkingOn}
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
    </>
  );
};
