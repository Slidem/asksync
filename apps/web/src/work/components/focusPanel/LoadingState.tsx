"use client";

import { Target } from "lucide-react";

export function LoadingState() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Target className="h-5 w-5" />
          Current Focus
        </h2>
      </div>
      <div className="flex-1 p-6">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    </div>
  );
}
