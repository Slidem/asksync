import { addMinutes, differenceInMinutes, startOfDay } from "date-fns";

import { create } from "zustand";

export interface GhostEvent {
  startTime: Date;
  endTime: Date;
  dayColumnIndex?: number; // For week view, which day column (0-6)
}

interface TemporaryEventState {
  // Ghost event being created via drag
  ghostEvent: GhostEvent | null;

  // Drag state
  isCreating: boolean;
  isDragging: boolean;
  dragStartPosition: { x: number; y: number } | null;

  // Actions
  startCreating: (
    startTime: Date,
    position: { x: number; y: number },
    dayColumnIndex?: number,
  ) => void;
  updateCreating: (endTime: Date, isDragging: boolean) => void;
  finishCreating: () => GhostEvent | null;
  cancelCreating: () => void;

  // Utility
  getSnappedTime: (date: Date, time: number) => Date;
}

const DRAG_THRESHOLD = 5; // pixels
const MIN_DURATION_MINUTES = 15; // minimum event duration

export const useTemporaryEventStore = create<TemporaryEventState>(
  (set, get) => ({
    ghostEvent: null,
    isCreating: false,
    isDragging: false,
    dragStartPosition: null,

    startCreating: (startTime, position, dayColumnIndex) => {
      const snappedStart = get().getSnappedTime(
        startTime,
        startTime.getHours() + startTime.getMinutes() / 60,
      );
      set({
        ghostEvent: {
          startTime: snappedStart,
          endTime: addMinutes(snappedStart, 60), // Default 1 hour duration
          dayColumnIndex,
        },
        isCreating: true,
        isDragging: false,
        dragStartPosition: position,
      });
    },

    updateCreating: (endTime, isDragging) => {
      const state = get();
      if (!state.ghostEvent) return;

      const snappedEnd = state.getSnappedTime(
        endTime,
        endTime.getHours() + endTime.getMinutes() / 60,
      );

      // Ensure minimum duration
      let finalEndTime = snappedEnd;
      const duration = differenceInMinutes(
        snappedEnd,
        state.ghostEvent.startTime,
      );

      if (duration < MIN_DURATION_MINUTES) {
        finalEndTime = addMinutes(
          state.ghostEvent.startTime,
          MIN_DURATION_MINUTES,
        );
      }

      // Handle drag direction (allow dragging upward to set earlier start time)
      let finalStartTime = state.ghostEvent.startTime;
      if (snappedEnd < state.ghostEvent.startTime) {
        // User is dragging upward
        finalStartTime = snappedEnd;
        finalEndTime = state.ghostEvent.startTime;

        // Ensure minimum duration when dragging upward
        const reverseDuration = differenceInMinutes(
          finalEndTime,
          finalStartTime,
        );
        if (reverseDuration < MIN_DURATION_MINUTES) {
          finalStartTime = addMinutes(finalEndTime, -MIN_DURATION_MINUTES);
        }
      }

      set({
        ghostEvent: {
          ...state.ghostEvent,
          startTime: finalStartTime,
          endTime: finalEndTime,
        },
        isDragging,
      });
    },

    finishCreating: () => {
      const state = get();
      const event = state.ghostEvent;

      set({
        ghostEvent: null,
        isCreating: false,
        isDragging: false,
        dragStartPosition: null,
      });

      return event;
    },

    cancelCreating: () => {
      set({
        ghostEvent: null,
        isCreating: false,
        isDragging: false,
        dragStartPosition: null,
      });
    },

    getSnappedTime: (date: Date, timeHours: number) => {
      // Snap to 15-minute intervals
      const baseDate = startOfDay(date);
      const hours = Math.floor(timeHours);
      const minutesFraction = timeHours - hours;
      const minutes = Math.round((minutesFraction * 60) / 15) * 15;

      const snappedDate = new Date(baseDate);
      snappedDate.setHours(hours);
      snappedDate.setMinutes(minutes % 60);

      // Handle overflow to next hour
      if (minutes >= 60) {
        snappedDate.setHours(hours + Math.floor(minutes / 60));
      }

      snappedDate.setSeconds(0);
      snappedDate.setMilliseconds(0);

      return snappedDate;
    },
  }),
);

// Helper to check if drag threshold is exceeded
export const isDragThresholdExceeded = (
  startPos: { x: number; y: number } | null,
  currentPos: { x: number; y: number },
): boolean => {
  if (!startPos) return false;

  const deltaX = Math.abs(currentPos.x - startPos.x);
  const deltaY = Math.abs(currentPos.y - startPos.y);

  return deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD;
};
