"use client";

import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TimeblockInfoProps } from "./types";

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function TimeblockInfo({
  timeblock,
  tasks,
  completedCount,
  progress,
}: TimeblockInfoProps) {
  return (
    <div className="p-3 bg-muted rounded-lg">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold">{timeblock.title}</h3>
          {timeblock.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {timeblock.description}
            </p>
          )}
        </div>
        <Badge variant="outline" className="ml-2">
          <Clock className="h-3 w-3 mr-1" />
          {formatTime(timeblock.startTime)} - {formatTime(timeblock.endTime)}
        </Badge>
      </div>

      {/* Progress Bar */}
      {tasks.length > 0 && (
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-muted-foreground/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
