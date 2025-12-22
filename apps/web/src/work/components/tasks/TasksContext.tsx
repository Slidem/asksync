import { createContext, useContext } from "react";

interface TasksListContextProps {
  timeblockId: string;
  isReadOnly?: boolean;
  maxTasks?: number;
  onTaskAdded?: (content: string) => void;
  onTaskRemoved?: (id: string) => void;
  onTaskEdited?: (id: string, newContent: string) => void;
  onTaskCompleted?: (id: string, completed: boolean) => void;
  onTaskActiveStateChanged?: (
    id: string,
    isCurrentlyWorkingOn: boolean,
  ) => void;
}

export const TasksListContext = createContext<TasksListContextProps>({
  timeblockId: "",
});

export const useTasksContext = () => useContext(TasksListContext);

export const TasksListProvider: React.FC<
  React.PropsWithChildren<TasksListContextProps>
> = ({ children, ...props }) => {
  return (
    <TasksListContext.Provider value={props}>
      {children}
    </TasksListContext.Provider>
  );
};
