"use client";

import { GhostEvent } from "@/schedule/components/GhostEvent";
import { GhostEvent as GhostEventType } from "@/schedule/stores/temporaryEventStore";
import React from "react";
import { cn } from "@/lib/utils";
import { useGhostEventPosition } from "../hooks/ghostEvent";

// Props for day view
interface DayViewProps {
  view: "day";
  ghostEvent: GhostEventType | null;
  isDragging: boolean;
  className?: string;
}

// Props for week view
interface WeekViewProps {
  view: "week";
  dayIndex: number;
  ghostEvent: GhostEventType | null;
  isDragging: boolean;
  className?: string;
}

// Props for month view (future)
interface MonthViewProps {
  view: "month";
  ghostEvent: GhostEventType | null;
  isDragging: boolean;
  className?: string;
}

type GhostEventOverlayProps = DayViewProps | WeekViewProps | MonthViewProps;

/**
 * Self-contained ghost event overlay component
 * Calculates its own position and visibility based on view type
 */
export function GhostEventOverlay(props: GhostEventOverlayProps) {
  const { ghostEvent, view, isDragging, className } = props;

  // Extract dayIndex for week view
  const dayIndex = props.view === "week" ? props.dayIndex : undefined;

  // Use the hook to calculate position and visibility
  const { position, isVisible } = useGhostEventPosition({
    ghostEvent,
    view,
    dayIndex,
  });

  // Don't render if not visible or no position
  if (!isVisible || !position || !ghostEvent) {
    return null;
  }

  const positionStyles: React.CSSProperties = {
    top: `${position.top}px`,
    height: `${position.height}px`,
    left: position.left ?? 0,
    right: position.right ?? 0,
    ...(position.width && { width: position.width }),
  };

  return (
    <div
      className={cn("pointer-events-none absolute z-30 px-0.5", className)}
      style={positionStyles}
    >
      <GhostEvent
        startTime={ghostEvent.startTime}
        endTime={ghostEvent.endTime}
        view={view}
        isDragging={isDragging}
      />
    </div>
  );
}
