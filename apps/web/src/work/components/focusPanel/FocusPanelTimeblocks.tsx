import { Badge } from "@/components/ui/badge";
import { SheetClose } from "@/components/ui/sheet";
import React from "react";
import { Target, X } from "lucide-react";
import { TimeblockInfo } from "@/work/components/focusPanel/TimeblockInfo";
import { useCurrentTimeblock as useCurrentTimeblocks } from "@/work/hooks/useCurrentTimeblock";

export const FocusPanelTimeblocks = () => {
  const { timeblockData, isLoading } = useCurrentTimeblocks();

  const timeblocks = timeblockData?.timeblocks || [];
  const tasks = timeblockData?.tasks || [];
  const completedTasks = tasks.filter((t) => t.completed);

  const calculateTimeblockCompletedCount = (timeblockId: string) => {
    return tasks.filter((t) => t.timeblockId === timeblockId && t.completed)
      .length;
  };

  const calculateTimeblockPRogress = (timeblockId: string) => {
    const timeblockTasks = tasks.filter((t) => t.timeblockId === timeblockId);
    if (timeblockTasks.length === 0) return 0;
    const completedCount = timeblockTasks.filter((t) => t.completed).length;
    return (completedCount / timeblockTasks.length) * 100;
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="p-6 border-b">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Target className="h-5 w-5" />
          Current Focus
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {completedTasks.length}/{tasks.length} done
          </Badge>
          <SheetClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </SheetClose>
        </div>
      </div>

      <div className="space-y-3">
        {timeblocks.map((timeblock) => (
          <TimeblockInfo
            key={timeblock._id}
            timeblock={timeblock}
            tasks={tasks.filter((t) => t.timeblockId === timeblock._id)}
            completedCount={calculateTimeblockCompletedCount(timeblock._id)}
            progress={calculateTimeblockPRogress(timeblock._id)}
          />
        ))}
      </div>
    </div>
  );
};
