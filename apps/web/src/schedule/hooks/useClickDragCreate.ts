import {
  isDragThresholdExceeded,
  useTemporaryEventStore,
} from "@/schedule/stores/temporaryEventStore";
import { useCallback, useEffect, useRef } from "react";

interface UseClickDragCreateProps {
  onEventCreate: (startTime: Date, endTime: Date) => void;
  view: "day" | "week" | "month";
}

export function useClickDragCreate({
  onEventCreate,
  view,
}: UseClickDragCreateProps) {
  const {
    isCreating,
    isDragging,
    dragStartPosition,
    ghostEvent,
    startCreating,
    updateCreating,
    finishCreating,
    cancelCreating,
  } = useTemporaryEventStore();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);

  // Convert mouse position to time based on position in calendar
  const getTimeFromPosition = useCallback(
    (e: MouseEvent, startDate?: Date): { date: Date; time: number } | null => {
      if (!containerRef.current) return null;

      const rect = containerRef.current.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;

      // For week view, we need to determine which day column
      let dayOffset = 0;
      if (view === "week") {
        const relativeX = e.clientX - rect.left;
        const columnWidth = rect.width / 8; // 7 days + 1 time column
        dayOffset = Math.floor(relativeX / columnWidth) - 1; // -1 to account for time column
        dayOffset = Math.max(0, Math.min(6, dayOffset)); // Clamp to 0-6
      }

      // Calculate time from Y position
      // Assuming the calendar shows 6am to 9pm (15 hours)
      const START_HOUR = 6;
      const END_HOUR = 21;
      const TOTAL_HOURS = END_HOUR - START_HOUR;

      const hoursFraction = (relativeY / rect.height) * TOTAL_HOURS;
      const timeHours = START_HOUR + hoursFraction;

      const baseDate = startDate || new Date();
      const resultDate = new Date(baseDate);

      if (view === "week") {
        // Adjust date based on column
        resultDate.setDate(baseDate.getDate() + dayOffset);
      }

      return { date: resultDate, time: timeHours };
    },
    [view],
  );

  const handleMouseDown = useCallback(
    (e: MouseEvent, startDate: Date, dayColumnIndex?: number) => {
      if (e.button !== 0) return; // Only handle left click

      const position = { x: e.clientX, y: e.clientY };
      startCreating(startDate, position, dayColumnIndex);
      isDraggingRef.current = false;

      e.preventDefault();
    },
    [startCreating],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isCreating || !dragStartPosition) return;

      const currentPos = { x: e.clientX, y: e.clientY };

      // Check if we've exceeded the drag threshold
      if (!isDraggingRef.current) {
        if (isDragThresholdExceeded(dragStartPosition, currentPos)) {
          isDraggingRef.current = true;
        } else {
          return; // Haven't started dragging yet
        }
      }

      // Calculate the time based on mouse position
      const timeInfo = getTimeFromPosition(e, ghostEvent?.startTime);
      if (timeInfo && ghostEvent) {
        // Create a date with the calculated time
        const endTime = new Date(timeInfo.date);
        endTime.setHours(Math.floor(timeInfo.time));
        endTime.setMinutes((timeInfo.time % 1) * 60);

        updateCreating(endTime, true);
      }
    },
    [
      isCreating,
      dragStartPosition,
      ghostEvent,
      getTimeFromPosition,
      updateCreating,
    ],
  );

  const handleMouseUp = useCallback(() => {
    if (!isCreating) return;

    const event = finishCreating();

    if (event) {
      // If we didn't drag, use the default 1-hour duration
      // Otherwise use the dragged duration
      onEventCreate(event.startTime, event.endTime);
    }

    isDraggingRef.current = false;
  }, [isCreating, finishCreating, onEventCreate]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCreating) {
        cancelCreating();
        isDraggingRef.current = false;
      }
    },
    [isCreating, cancelCreating],
  );

  // Set up global event listeners when creating
  useEffect(() => {
    if (isCreating) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isCreating, handleMouseMove, handleMouseUp, handleKeyDown]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isCreating) {
        cancelCreating();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    containerRef,
    handleCellMouseDown: handleMouseDown,
    ghostEvent,
    isCreating,
    isDragging,
  };
}
