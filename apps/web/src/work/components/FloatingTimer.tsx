"use client";

import { memo, useEffect, useRef, useState } from "react";
import { GripVertical, X } from "lucide-react";
import { MiniTimerDisplay } from "@/work/components/sidebar/MiniTimerDisplay";
import { MiniTimerControls } from "@/work/components/sidebar/MiniTimerControls";
import { useWorkModeStore } from "@/work/stores/workModeStore";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

/**
 * FloatingTimer - Mobile-only draggable timer
 * Can be hidden with localStorage persistence
 */
export const FloatingTimer = memo(function FloatingTimer() {
  const pathname = usePathname();
  const isWorkPage = pathname.includes("/work");

  const { settings, floatingTimerVisible, setFloatingTimerVisible } =
    useWorkModeStore(
      useShallow((state) => ({
        settings: state.settings,
        floatingTimerVisible: state.floatingTimerVisible,
        setFloatingTimerVisible: state.setFloatingTimerVisible,
      })),
    );

  const [position, setPosition] = useState({ x: 16, y: 16 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const timerRef = useRef<HTMLDivElement>(null);

  // Load position from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("floatingTimerPosition");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPosition(parsed);
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  // Handle touch/mouse start
  const handleDragStart = (clientX: number, clientY: number) => {
    if (!timerRef.current) return;
    const rect = timerRef.current.getBoundingClientRect();
    setDragOffset({
      x: clientX - rect.left,
      y: clientY - rect.top,
    });
    setIsDragging(true);
  };

  // Handle touch/mouse move
  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;

    const newX = clientX - dragOffset.x;
    const newY = clientY - dragOffset.y;

    // Keep within viewport bounds
    const maxX = window.innerWidth - (timerRef.current?.offsetWidth || 0);
    const maxY = window.innerHeight - (timerRef.current?.offsetHeight || 0);

    const boundedX = Math.max(0, Math.min(newX, maxX));
    const boundedY = Math.max(0, Math.min(newY, maxY));

    setPosition({ x: boundedX, y: boundedY });
  };

  // Handle drag end
  const handleDragEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      localStorage.setItem("floatingTimerPosition", JSON.stringify(position));
    }
  };

  // Touch events
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const touch = e.touches[0];
      handleDragMove(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = () => {
      handleDragEnd();
    };

    if (isDragging) {
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);
      return () => {
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [isDragging, dragOffset, position]);

  // Mouse events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      handleDragEnd();
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragOffset, position]);

  // Don't render until settings loaded
  if (!settings) return null;

  // Don't render if hidden
  if (!floatingTimerVisible) return null;

  // Don't render on work page on mobile
  if (isWorkPage) return null;

  return (
    <div
      ref={timerRef}
      className={cn(
        "fixed z-50",
        "bg-background border rounded-lg shadow-lg",
        "p-3",
        "md:hidden", // Only show on mobile
        isDragging && "cursor-grabbing",
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        touchAction: "none",
      }}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <div
            className="cursor-grab active:cursor-grabbing touch-none"
            onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
            onTouchStart={(e) => {
              const touch = e.touches[0];
              handleDragStart(touch.clientX, touch.clientY);
            }}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <MiniTimerDisplay />
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setFloatingTimerVisible(false)}
            title="Hide timer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <MiniTimerControls />
      </div>
    </div>
  );
});
