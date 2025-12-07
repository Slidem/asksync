"use client";

import {
  UnderlineTabs,
  UnderlineTabsContent,
  UnderlineTabsList,
  UnderlineTabsTrigger,
} from "@/components/ui/UnderlineTabs";
import { memo, useCallback, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "./EmptyState";
import { Id } from "@/../../backend/convex/_generated/dataModel";
import { LoadingState } from "./LoadingState";
import { QuestionThreadModal } from "./QuestionThreadModal";
import { QuestionsPanel } from "./QuestionsPanel";
import { Target } from "lucide-react";
import { TasksList } from "./TasksList";
import { TimeblockInfo } from "./TimeblockInfo";
import { api } from "@/../../backend/convex/_generated/api";
import { useCurrentTimeblock } from "@/work/hooks/useCurrentTimeblock";
import { useMutation } from "convex/react";
import { useTimeblockQuestions } from "@/work/hooks/useTimeblockQuestions";
import { useWorkModeStore } from "@/work/stores/workModeStore";

export const CurrentFocusPanel = memo(function CurrentFocusPanel() {
  const { timeblockData, isLoading } = useCurrentTimeblock();
  const { questions } = useTimeblockQuestions(timeblockData?.timeblock._id);
  const activeSessionId = useWorkModeStore((state) => state.activeSessionId);
  const currentTaskId = useWorkModeStore((state) => state.currentTaskId);
  const currentQuestionId = useWorkModeStore(
    (state) => state.currentQuestionId,
  );
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null,
  );

  const updateProgress = useMutation(
    api.workSessions.mutations.progress.updateSessionProgress,
  );
  const updateTask = useMutation(api.tasks.mutations.update);
  const createTask = useMutation(api.tasks.mutations.create);
  const deleteTask = useMutation(api.tasks.mutations.remove);

  const handleTaskSelect = useCallback(
    async (taskId: Id<"tasks">) => {
      if (!activeSessionId) return;

      await updateProgress({
        sessionId: activeSessionId,
        taskId,
        timeblockId: timeblockData?.timeblock._id,
      });

      useWorkModeStore.setState({ currentTaskId: taskId });
    },
    [activeSessionId, timeblockData?.timeblock._id, updateProgress],
  );

  const handleTaskComplete = useCallback(
    async (taskId: Id<"tasks">, completed: boolean) => {
      await updateTask({
        id: taskId,
        completed,
        currentlyWorkingOn: false,
      });

      if (activeSessionId) {
        if (completed) {
          await updateProgress({
            sessionId: activeSessionId,
            completedTaskId: taskId,
          });
        } else {
          await updateProgress({
            sessionId: activeSessionId,
            uncompletedTaskId: taskId,
          });

          if (taskId === currentTaskId) {
            useWorkModeStore.setState({ currentTaskId: null });
            await updateProgress({
              sessionId: activeSessionId,
              taskId: undefined,
            });
          }
        }
      }
    },
    [activeSessionId, currentTaskId, updateProgress, updateTask],
  );

  const handleTaskWorkingOn = useCallback(
    async (taskId: Id<"tasks">, isCurrentlyWorkingOn: boolean) => {
      if (!isCurrentlyWorkingOn && timeblockData) {
        const otherWorkingTasks = timeblockData.tasks.filter(
          (t) => t.currentlyWorkingOn && t._id !== taskId,
        );
        for (const task of otherWorkingTasks) {
          await updateTask({
            id: task._id,
            currentlyWorkingOn: false,
          });
        }
      }

      await updateTask({
        id: taskId,
        currentlyWorkingOn: !isCurrentlyWorkingOn,
      });

      if (!isCurrentlyWorkingOn) {
        handleTaskSelect(taskId);
      }
    },
    [timeblockData, updateTask, handleTaskSelect],
  );

  const handleAddTask = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTaskTitle.trim() || !timeblockData) return;

      await createTask({
        timeblockId: timeblockData.timeblock._id,
        title: newTaskTitle.trim(),
      });

      setNewTaskTitle("");
      setIsAddingTask(false);
    },
    [newTaskTitle, timeblockData, createTask],
  );

  const handleDeleteTask = useCallback(
    async (taskId: Id<"tasks">) => {
      await deleteTask({ id: taskId });

      if (taskId === currentTaskId) {
        useWorkModeStore.setState({ currentTaskId: null });
      }
    },
    [deleteTask, currentTaskId],
  );

  const handleQuestionWorkingOn = useCallback(
    async (questionId: string) => {
      if (!activeSessionId) return;

      await updateProgress({
        sessionId: activeSessionId,
        questionId: questionId as Id<"questions">,
      });

      useWorkModeStore.setState({
        currentQuestionId: questionId as Id<"questions">,
      });
    },
    [activeSessionId, updateProgress],
  );

  const handleViewThread = useCallback((questionId: string) => {
    setSelectedQuestionId(questionId);
  }, []);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!timeblockData) {
    return <EmptyState />;
  }

  const { timeblock, tasks } = timeblockData;
  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
  const incompleteTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Target className="h-5 w-5" />
            Current Focus
          </h2>
          <Badge variant="secondary">
            {completedCount}/{tasks.length} done
          </Badge>
        </div>

        <TimeblockInfo
          timeblock={timeblock}
          tasks={tasks}
          completedCount={completedCount}
          progress={progress}
        />
      </div>

      <div className="flex-1 p-6 flex flex-col overflow-hidden">
        <UnderlineTabs defaultValue="tasks" className="flex-1 flex flex-col">
          <UnderlineTabsList className="mb-4">
            <UnderlineTabsTrigger value="tasks" badge={tasks.length}>
              Tasks
            </UnderlineTabsTrigger>
            <UnderlineTabsTrigger value="questions" badge={questions.length}>
              Questions
            </UnderlineTabsTrigger>
          </UnderlineTabsList>

          <UnderlineTabsContent
            value="tasks"
            className="flex-1 flex flex-col mt-0"
          >
            <TasksList
              tasks={tasks}
              incompleteTasks={incompleteTasks}
              completedTasks={completedTasks}
              currentTaskId={currentTaskId}
              isAddingTask={isAddingTask}
              newTaskTitle={newTaskTitle}
              activeSessionId={activeSessionId}
              onTaskComplete={handleTaskComplete}
              onTaskWorkingOn={handleTaskWorkingOn}
              onUpdateTask={(taskId, title) =>
                updateTask({ id: taskId, title })
              }
              onDeleteTask={handleDeleteTask}
              onAddTask={handleAddTask}
              onNewTaskTitleChange={setNewTaskTitle}
              onToggleAddingTask={setIsAddingTask}
            />
          </UnderlineTabsContent>

          <UnderlineTabsContent
            value="questions"
            className="flex-1 flex flex-col mt-0"
          >
            <QuestionsPanel
              questions={questions}
              currentQuestionId={currentQuestionId}
              activeSessionId={activeSessionId}
              onViewThread={handleViewThread}
              onWorkingOn={handleQuestionWorkingOn}
            />
          </UnderlineTabsContent>
        </UnderlineTabs>
      </div>

      <QuestionThreadModal
        questionId={selectedQuestionId as Id<"questions"> | null}
        open={!!selectedQuestionId}
        onOpenChange={(open) => {
          if (!open) setSelectedQuestionId(null);
        }}
      />
    </div>
  );
});
