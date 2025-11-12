import {
  END_HOUR,
  START_HOUR,
  WEEK_CELLS_HEIGHT_PX,
} from "@/schedule/constants";
import {
  GhostEvent,
  isDragThresholdExceeded,
  useTemporaryEventStore,
} from "@/schedule/stores/temporaryEventStore";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { GhostEventPosition } from "@/schedule/types";

interface UseGhostEventHandlersOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  onEventCreated?: (event: { startTime: Date; endTime: Date }) => void;
  onEventClick?: (event: { start: Date; end?: Date }) => void;
}
/**
 * Custom hook to handle ghost event creation via drag and drop
 * Provides all the necessary handlers and state for ghost event functionality
 */

export function useGhostEventHandlers({
  containerRef,
  onEventCreated,
  onEventClick,
}: UseGhostEventHandlersOptions) {
  const {
    ghostEvent,
    isCreating,
    isDragging,
    dragStartPosition,
    startCreating,
    updateCreating,
    finishCreating,
    cancelCreating,
  } = useTemporaryEventStore();

  const isDraggingRef = useRef(false);

  // Handle mouse down on a cell
  const handleCellMouseDown = useCallback(
    (e: React.MouseEvent, startTime: Date, dayColumnIndex?: number) => {
      if (e.button !== 0) return; // Only handle left click

      const position = { x: e.clientX, y: e.clientY };
      startCreating(startTime, position, dayColumnIndex);
      isDraggingRef.current = false;

      e.preventDefault();
      e.stopPropagation();
    },
    [startCreating],
  );

  // Handle global mouse move
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isCreating || !dragStartPosition || !containerRef.current) return;

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
      const rect = containerRef.current.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;

      // Calculate which hour we're hovering over
      const hoursFraction = (relativeY / rect.height) * (END_HOUR - START_HOUR);
      const timeHours = START_HOUR + hoursFraction;

      if (ghostEvent) {
        const endTime = new Date(ghostEvent.startTime);
        endTime.setHours(Math.floor(timeHours));
        endTime.setMinutes((timeHours % 1) * 60);

        updateCreating(endTime, true);
      }
    },
    [isCreating, dragStartPosition, ghostEvent, updateCreating, containerRef],
  );

  // Handle global mouse up
  const handleMouseUp = useCallback(() => {
    if (!isCreating) return;

    const event = finishCreating();

    if (event) {
      if (onEventCreated) {
        onEventCreated(event);
      } else if (onEventClick) {
        // Fallback to click handler
        if (!isDraggingRef.current) {
          // If we didn't drag, create a 1-hour event (default behavior)
          onEventClick({ start: event.startTime });
        } else {
          // If we dragged, create event with the dragged duration
          onEventClick({ start: event.startTime, end: event.endTime });
        }
      }
    }

    isDraggingRef.current = false;
  }, [isCreating, finishCreating, onEventCreated, onEventClick]);

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCreating) {
        cancelCreating();
        isDraggingRef.current = false;
      }
    },
    [isCreating, cancelCreating],
  );

  // Handle click on cell (for non-drag creation)
  const handleCellClick = useCallback(
    (startTime: Date) => {
      if (!isCreating && onEventClick) {
        onEventClick({ start: startTime });
      }
    },
    [isCreating, onEventClick],
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
    // State
    ghostEvent,
    isCreating,
    isDragging,

    // Handlers
    handleCellMouseDown,
    handleCellClick,

    // Refs for internal use
    isDraggingRef: isDraggingRef.current,
  };
}
interface UseGhostEventPositionOptions {
  ghostEvent: GhostEvent | null;
  view: "day" | "week" | "month";
  dayIndex?: number; // Only for week view
}
/**
 * Calculate ghost event position based on view type
 * Returns position data and visibility flag
 */

export function useGhostEventPosition({
  ghostEvent,
  view,
  dayIndex,
}: UseGhostEventPositionOptions): {
  position: GhostEventPosition | null;
  isVisible: boolean;
} {
  const position = useMemo(() => {
    if (!ghostEvent) return null;

    const startHour =
      ghostEvent.startTime.getHours() + ghostEvent.startTime.getMinutes() / 60;
    const endHour =
      ghostEvent.endTime.getHours() + ghostEvent.endTime.getMinutes() / 60;

    const top = (startHour - START_HOUR) * WEEK_CELLS_HEIGHT_PX;
    const height = (endHour - startHour) * WEEK_CELLS_HEIGHT_PX;

    return {
      top,
      height,
      left: 0,
      right: 0,
    };
  }, [ghostEvent]);

  const isVisible = useMemo(() => {
    if (!ghostEvent || !position) return false;

    // For day view, always show if ghost event exists
    if (view === "day") {
      return true;
    }

    // For week view, only show if the dayIndex matches the ghost event's day column
    if (view === "week") {
      return (
        ghostEvent.dayColumnIndex !== undefined &&
        ghostEvent.dayColumnIndex === dayIndex
      );
    }

    // For month view, we would need additional logic
    // For now, return false as month view ghost events are not implemented
    if (view === "month") {
      return false;
    }

    return false;
  }, [ghostEvent, position, view, dayIndex]);

  return { position, isVisible };
}
