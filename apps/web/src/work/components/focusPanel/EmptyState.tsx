"use client";

import { AlertCircle, Target } from "lucide-react";

export function EmptyState() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Target className="h-5 w-5" />
          Current Focus
        </h2>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center text-muted-foreground">
          <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No Active Timeblock</p>
          <p className="text-sm mt-1">
            Create a timeblock in your schedule to track tasks
          </p>
        </div>
      </div>
    </div>
  );
}
