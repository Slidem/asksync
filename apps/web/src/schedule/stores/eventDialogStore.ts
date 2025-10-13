import type { CalendarEvent, EventColor } from "@/schedule/types";
import {
  DefaultEndHour,
  DefaultStartHour,
  EndHour,
  StartHour,
} from "@/schedule/constants";

import { RecurrenceRule } from "@asksync/shared";
import { create } from "zustand";
import { format } from "date-fns";

export interface TimeOption {
  value: string;
  label: string;
}

export interface EventDialogState {
  // Form fields
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  allDay: boolean;
  location: string;
  color: EventColor;
  selectedTagIds: string[];
  isRecurring: boolean;
  recurrenceRule?: RecurrenceRule;
  error: string | null;

  // UI state
  startDateOpen: boolean;
  endDateOpen: boolean;

  // Event metadata
  eventId: string | null;
  source: "asksync" | "google" | "outlook";
  externalId: string | undefined;
  timezone: string;
  canEdit: boolean | undefined;
  canDelete: boolean | undefined;
  canEditTags: boolean | undefined;

  // Computed values
  timeOptions: TimeOption[];
  isExternalEvent: boolean;
  canOnlyEditTags: boolean;
  canDeleteEvent: boolean;

  // Actions
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setStartDate: (date: Date) => void;
  setEndDate: (date: Date) => void;
  setStartTime: (time: string) => void;
  setEndTime: (time: string) => void;
  setAllDay: (allDay: boolean) => void;
  setLocation: (location: string) => void;
  setColor: (color: EventColor) => void;
  setSelectedTagIds: (tagIds: string[]) => void;
  toggleTagId: (tagId: string) => void;
  setIsRecurring: (recurring: boolean) => void;
  setRecurrenceRule: (rule: RecurrenceRule) => void;
  setError: (error: string | null) => void;
  setStartDateOpen: (open: boolean) => void;
  setEndDateOpen: (open: boolean) => void;

  // Complex actions
  loadEvent: (event: CalendarEvent | null) => void;
  reset: () => void;
  validateAndGetEvent: () =>
    | { event: CalendarEvent; error: null }
    | { event: null; error: string };
}

// Generate time options once at module level
const generateTimeOptions = (): TimeOption[] => {
  const options: TimeOption[] = [];
  for (let hour = StartHour; hour <= EndHour; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const formattedHour = hour.toString().padStart(2, "0");
      const formattedMinute = minute.toString().padStart(2, "0");
      const value = `${formattedHour}:${formattedMinute}`;
      // Use a fixed date to avoid unnecessary date object creations
      const date = new Date(2000, 0, 1, hour, minute);
      const label = format(date, "h:mm a");
      options.push({ value, label });
    }
  }
  return options;
};

const timeOptions = generateTimeOptions();

// Helper function for formatting time
const formatTimeForInput = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = Math.floor(date.getMinutes() / 15) * 15;
  return `${hours}:${minutes.toString().padStart(2, "0")}`;
};

// Default values
const getDefaultState = (): Omit<
  EventDialogState,
  | "timeOptions"
  | "isExternalEvent"
  | "canOnlyEditTags"
  | "canDeleteEvent"
  | "setTitle"
  | "setDescription"
  | "setStartDate"
  | "setEndDate"
  | "setStartTime"
  | "setEndTime"
  | "setAllDay"
  | "setLocation"
  | "setColor"
  | "setSelectedTagIds"
  | "toggleTagId"
  | "setIsRecurring"
  | "setRecurrenceRule"
  | "setError"
  | "setStartDateOpen"
  | "setEndDateOpen"
  | "loadEvent"
  | "reset"
  | "validateAndGetEvent"
> => ({
  title: "",
  description: "",
  startDate: new Date(),
  endDate: new Date(),
  startTime: `${DefaultStartHour}:00`,
  endTime: `${DefaultEndHour}:00`,
  allDay: false,
  location: "",
  color: "sky" as EventColor,
  selectedTagIds: [],
  isRecurring: false,
  error: null,
  startDateOpen: false,
  endDateOpen: false,
  eventId: null,
  source: "asksync" as const,
  externalId: undefined,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  canEdit: undefined,
  canDelete: undefined,
  canEditTags: undefined,
});

export const useEventDialogStore = create<EventDialogState>((set, get) => ({
  ...getDefaultState(),

  // Computed values
  timeOptions,
  get isExternalEvent() {
    const state = get();
    return state.source !== "asksync";
  },
  get canOnlyEditTags() {
    const state = get();
    return state.isExternalEvent && state.canEditTags === true;
  },
  get canDeleteEvent() {
    const state = get();
    return state.canDelete !== false && !state.isExternalEvent;
  },

  // Simple setters
  setTitle: (title) => set({ title }),
  setDescription: (description) => set({ description }),
  setStartDate: (startDate) =>
    set((state) => {
      const updates: Partial<EventDialogState> = { startDate, error: null };
      // If end date is before the new start date, update it to match
      if (state.endDate < startDate) {
        updates.endDate = startDate;
      }
      return updates;
    }),
  setEndDate: (endDate) => set({ endDate, error: null }),
  setStartTime: (startTime) => set({ startTime }),
  setEndTime: (endTime) => set({ endTime }),
  setAllDay: (allDay) => set({ allDay }),
  setLocation: (location) => set({ location }),
  setColor: (color) => set({ color }),
  setSelectedTagIds: (selectedTagIds) => set({ selectedTagIds }),
  toggleTagId: (tagId) =>
    set((state) => ({
      selectedTagIds: state.selectedTagIds.includes(tagId)
        ? state.selectedTagIds.filter((id) => id !== tagId)
        : [...state.selectedTagIds, tagId],
    })),
  setIsRecurring: (isRecurring) => set({ isRecurring }),
  setRecurrenceRule: (recurrenceRule) => set({ recurrenceRule }),
  setError: (error) => set({ error }),
  setStartDateOpen: (startDateOpen) => set({ startDateOpen }),
  setEndDateOpen: (endDateOpen) => set({ endDateOpen }),

  // Complex actions
  loadEvent: (event) =>
    set(() => {
      if (!event) {
        return getDefaultState();
      }

      const start = new Date(event.start);
      const end = new Date(event.end);

      return {
        ...getDefaultState(),
        title: event.title || "",
        description: event.description || "",
        startDate: start,
        endDate: end,
        startTime: formatTimeForInput(start),
        endTime: formatTimeForInput(end),
        allDay: event.allDay || false,
        location: event.location || "",
        color: (event.color as EventColor) || "sky",
        selectedTagIds: event.tagIds || [],
        isRecurring: event.isRecurring || false,
        recurrenceRule: event.recurrenceRule || undefined,
        eventId: event.id,
        source: (event.source || "asksync") as "asksync" | "google" | "outlook",
        externalId: event.externalId,
        timezone:
          event.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        canEdit: event.canEdit,
        canDelete: event.canDelete,
        canEditTags: event.canEditTags,
      };
    }),

  reset: () => set(getDefaultState()),

  validateAndGetEvent: () => {
    const state = get();
    const start = new Date(state.startDate);
    const end = new Date(state.endDate);

    if (!state.allDay) {
      const [startHours = 0, startMinutes = 0] = state.startTime
        .split(":")
        .map(Number);
      const [endHours = 0, endMinutes = 0] = state.endTime
        .split(":")
        .map(Number);

      if (
        startHours < StartHour ||
        startHours > EndHour ||
        endHours < StartHour ||
        endHours > EndHour
      ) {
        const error = `Selected time must be between ${StartHour}:00 and ${EndHour}:00`;
        set({ error });
        return { event: null, error };
      }

      start.setHours(startHours, startMinutes, 0);
      end.setHours(endHours, endMinutes, 0);
    } else {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }

    // Validate that end date is not before start date
    if (end < start) {
      const error = "End date cannot be before start date";
      set({ error });
      return { event: null, error };
    }

    // Use generic title if empty
    const eventTitle = state.title.trim() ? state.title : "(no title)";

    const event: CalendarEvent = {
      id: state.eventId || "",
      title: eventTitle,
      description: state.description,
      start,
      end,
      allDay: state.allDay,
      location: state.location,
      color: state.color,
      tagIds: state.selectedTagIds,
      isRecurring: state.isRecurring,
      recurrenceRule: state.isRecurring ? state.recurrenceRule : undefined,
      source: state.source,
      externalId: state.externalId,
      timezone: state.timezone,
      canEdit: state.canEdit,
      canDelete: state.canDelete,
      canEditTags: state.canEditTags,
    };

    set({ error: null });
    return { event, error: null };
  },
}));
