"use client";

import { AddTaskInput } from "@/tasks/components/AddTaskInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Task } from "@/tasks/model";
import { Task as TaskItem } from "@/tasks/components/Task";

interface Props {
  incompleteTasks: Task[];
  completedTasks: Task[];
}

export const TasksList: React.FC<Props> = ({
  incompleteTasks,
  completedTasks,
}) => {
  return (
    <div className="flex-1 flex flex-col">
      <h4 className="text-sm font-medium mb-4">Tasks</h4>

      <ScrollArea className="flex-1 -mx-2">
        <div className="px-2">
          <div className="space-y-2">
            {incompleteTasks.map((task) => (
              <TaskItem
                key={task.id}
                id={task.id}
                title={task.title}
                isCurrentlyWorkingOn={task.currentlyWorkingOn}
                isCompleted={task.completed}
              />
            ))}
            <AddTaskInput />
          </div>

          {/* Completed tasks section with divider */}
          {completedTasks.length > 0 && (
            <>
              <div className="flex items-center gap-2 mt-6 mb-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground px-2">
                  Completed
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="space-y-2">
                {completedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    isCurrentlyWorkingOn={task.currentlyWorkingOn}
                    isCompleted={task.completed}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
