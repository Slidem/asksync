import { Doc, Id } from "@/../../backend/convex/_generated/dataModel";

export interface TaskItemProps {
  task: Doc<"tasks">;
  isActive: boolean;
  isWorkingOn: boolean;
  onComplete: (completed: boolean) => void;
  onWorkingOn: () => void;
  onUpdateTitle: (title: string) => void;
  onDelete: () => void;
  disabled: boolean;
}

export interface TimeblockInfoProps {
  timeblock: Doc<"timeblocks">;
  tasks: Doc<"tasks">[];
  completedCount: number;
  progress: number;
}

export interface TasksListProps {
  tasks: Doc<"tasks">[];
  incompleteTasks: Doc<"tasks">[];
  completedTasks: Doc<"tasks">[];
  currentTaskId: Id<"tasks"> | null;
  isAddingTask: boolean;
  newTaskTitle: string;
  activeSessionId: Id<"workSessions"> | null;
  onTaskComplete: (taskId: Id<"tasks">, completed: boolean) => void;
  onTaskWorkingOn: (taskId: Id<"tasks">, isCurrentlyWorkingOn: boolean) => void;
  onUpdateTask: (taskId: Id<"tasks">, title: string) => void;
  onDeleteTask: (taskId: Id<"tasks">) => void;
  onAddTask: (e: React.FormEvent) => void;
  onNewTaskTitleChange: (title: string) => void;
  onToggleAddingTask: (isAdding: boolean) => void;
}
