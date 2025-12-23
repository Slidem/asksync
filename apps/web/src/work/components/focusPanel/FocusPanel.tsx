"use client";

import { ChevronLeft, Target } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { memo, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { CurrentFocusPanel } from "@/work/components/focusPanel/CurrentFocusPanel";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useShallow } from "zustand/react/shallow";
import { useWorkModeStore } from "@/work/stores/workModeStore";

/**
 * Focus panel using shadcn Sheet component
 * - Desktop: right side sheet
 * - Mobile: bottom sheet
 * - Auto-collapses when timer starts
 */
export const FocusPanel = memo(function FocusPanel() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { isRunning, focusPanelOpen, setFocusPanelOpen } = useWorkModeStore(
    useShallow((state) => ({
      isRunning: state.isRunning,
      focusPanelOpen: state.focusPanelOpen,
      setFocusPanelOpen: state.setFocusPanelOpen,
    })),
  );

  // Auto-collapse when timer starts
  useEffect(() => {
    if (isRunning) {
      setFocusPanelOpen(false);
    }
  }, [isRunning, setFocusPanelOpen]);

  return (
    <>
      {/* Toggle button - different styles for mobile/desktop */}
      {!focusPanelOpen && (
        <Button
          variant={isMobile ? "default" : "outline"}
          size={isMobile ? "lg" : "sm"}
          onClick={() => setFocusPanelOpen(true)}
          className={cn(
            isMobile
              ? "fixed bottom-28 right-4 z-50 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 hover:scale-105 transition-all"
              : "absolute right-4 top-1/2 -translate-y-1/2 z-10 flex items-center gap-2 px-3 py-6 rounded-full shadow-lg bg-background hover:bg-muted/50 border-2 transition-all hover:scale-105",
          )}
        >
          {!isMobile && <ChevronLeft className="h-4 w-4" />}
          <Target className={isMobile ? "h-6 w-6" : "h-4 w-4"} />
          <span className="sr-only">Show Focus Panel</span>
        </Button>
      )}

      {/* Sheet - handles overlay, animations, close button, click-outside */}
      <Sheet open={focusPanelOpen} onOpenChange={setFocusPanelOpen}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          hideCloseButton
          className={cn(
            isMobile
              ? "max-h-[70vh] rounded-t-xl"
              : "w-[400px] sm:max-w-[450px]",
          )}
        >
          <SheetTitle className="sr-only">Focus Panel</SheetTitle>
          <div
            className={cn(
              "overflow-y-auto",
              isMobile ? "max-h-[calc(70vh-60px)]" : "h-full",
            )}
          >
            <CurrentFocusPanel />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
});
