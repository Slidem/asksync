"use client";

import { ChevronLeft, ChevronRight, Target } from "lucide-react";
import { memo, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { CurrentFocusPanel } from "./CurrentFocusPanel";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useWorkModeStore } from "../stores/workModeStore";

/**
 * Collapsible drawer containing the CurrentFocusPanel
 * Auto-collapses when timer starts, can be manually toggled
 */
export const FocusPanelDrawer = memo(function FocusPanelDrawer() {
  const isRunning = useWorkModeStore((state) => state.isRunning);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Auto-collapse when timer starts
  useEffect(() => {
    if (isRunning) {
      setIsCollapsed(true);
    }
  }, [isRunning]);

  // Mobile bottom sheet implementation
  if (isMobile) {
    return (
      <>
        {/* Toggle button for mobile */}
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "fixed bottom-4 right-4 z-50 rounded-full shadow-lg",
            "bg-white dark:bg-slate-900 hover:scale-105 transition-transform",
            !isCollapsed && "hidden",
          )}
          onClick={() => setIsCollapsed(false)}
        >
          <Target className="h-4 w-4" />
        </Button>

        {/* Mobile bottom sheet */}
        <div
          className={cn(
            "fixed inset-x-0 bottom-0 z-40",
            "bg-white dark:bg-slate-900 border-t dark:border-slate-800",
            "transition-transform duration-300 ease-in-out",
            "max-h-[60vh] overflow-hidden",
            isCollapsed ? "translate-y-full" : "translate-y-0",
          )}
        >
          {/* Handle bar for dragging/closing */}
          <button
            onClick={() => setIsCollapsed(true)}
            className="w-full py-2 flex justify-center hover:bg-muted/50 transition-colors"
          >
            <div className="w-12 h-1 bg-muted-foreground/20 rounded-full" />
          </button>

          <div className="px-4 pb-4 h-full overflow-y-auto">
            <CurrentFocusPanel />
          </div>
        </div>
      </>
    );
  }

  // Desktop sidebar implementation
  return (
    <>
      {/* Collapsed state - floating button */}
      {isCollapsed && (
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "fixed right-4 top-1/2 -translate-y-1/2 z-50",
            "flex items-center gap-2 shadow-lg",
            "bg-white dark:bg-slate-900 hover:bg-muted/50",
          )}
          onClick={() => setIsCollapsed(false)}
        >
          <ChevronLeft className="h-4 w-4" />
          <Target className="h-4 w-4" />
          <span className="sr-only">Show Focus Panel</span>
        </Button>
      )}

      {/* Expanded drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 h-screen z-40",
          "bg-white dark:bg-slate-900 border-l dark:border-slate-800",
          "transition-all duration-300 ease-in-out",
          "w-full max-w-md lg:w-1/3",
          isCollapsed ? "translate-x-full" : "translate-x-0",
        )}
      >
        <div className="h-full flex flex-col">
          {/* Collapse button */}
          <div className="absolute left-2 top-4 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(true)}
              className="rounded-full hover:bg-muted/50"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Hide Focus Panel</span>
            </Button>
          </div>

          {/* Panel content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <CurrentFocusPanel />
          </div>
        </div>
      </div>
    </>
  );
});
