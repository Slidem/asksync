/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
"use client";

import { cn } from "@/lib/utils";
import { useCalendarDnd } from "@/schedule/components/CalendarDndContext";
import { useDroppable } from "@dnd-kit/core";
import React, { useCallback } from "react";

interface DroppableCellProps {
  id: string;
  date: Date;
  time?: number; // For week/day views, represents hours (e.g., 9.25 for 9:15)
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  onMouseDown?: (e: React.MouseEvent, startTime: Date) => void;
  dayColumnIndex?: number; // For week view to know which column
}

export function DroppableCell({
  id,
  date,
  time,
  children,
  className,
  onClick,
  onMouseDown,
  dayColumnIndex,
}: DroppableCellProps) {
  const { activeEvent } = useCalendarDnd();

  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      date,
      time,
    },
  });

  // Format time for display in tooltip (only for debugging)
  const formattedTime =
    time !== undefined
      ? `${Math.floor(time)}:${Math.round((time - Math.floor(time)) * 60)
          .toString()
          .padStart(2, "0")}`
      : null;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (onMouseDown && time !== undefined) {
        // Calculate the start time based on the cell's date and time
        const startTime = new Date(date);
        const hours = Math.floor(time);
        const minutes = Math.round((time - hours) * 60);
        startTime.setHours(hours, minutes, 0, 0);

        onMouseDown(e, startTime);
      }
    },
    [date, time, onMouseDown],
  );

  const handleClick = useCallback(() => {
    // Only trigger onClick if we're not in the middle of creating an event
    // This will be handled by the parent component
    if (onClick) {
      onClick();
    }
  }, [onClick]);

  return (
    <div
      ref={setNodeRef}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      className={cn(
        "data-dragging:bg-accent flex h-full flex-col overflow-hidden px-0.5 py-1 sm:px-1",
        "transition-colors",
        onMouseDown && "cursor-crosshair hover:bg-muted/50",
        className,
      )}
      title={formattedTime ? `${formattedTime}` : undefined}
      data-dragging={isOver && activeEvent ? true : undefined}
      data-column-index={dayColumnIndex}
    >
      {children}
    </div>
  );
}
