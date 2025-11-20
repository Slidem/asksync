import type { CalendarEvent, EventColor } from "@/schedule/types";
import {
  CalendarSource,
  PermissionGrant,
  RecurrenceRule,
} from "@asksync/shared";
import {
  DEFAULT_END_HOUR,
  DEFAULT_START_HOUR,
  END_HOUR,
  START_HOUR,
} from "@/schedule/constants";

import { create } from "zustand";

interface FormFields {
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
  recurrenceRule: RecurrenceRule | null;
  permissions: PermissionGrant[];
  error: string | null;
}

interface EventMetadata {
  eventId: string | null;
  source: CalendarSource;
  externalId: string | undefined;
  timezone: string;
  canEdit: boolean | undefined;
  canDelete: boolean | undefined;
  canEditTags: boolean | undefined;
  initialPermissions: PermissionGrant[];
}

export interface EventDialogState {
  isOpen: boolean;
  formFields: FormFields;
  eventMetadata: EventMetadata;
  eventToUpdate: CalendarEvent | null;
  isExternalEvent: boolean;
  canOnlyEditTags: boolean;
  canDeleteEvent: boolean;

  open: (event: CalendarEvent | null) => void;
  close: () => void;
  setFormFields: (fields: Partial<FormFields>) => void;
  setEventMetadata: (metadata: Partial<EventMetadata>) => void;
  toggleTagId: (tagId: string) => void;
  setPermissions: (permissions: PermissionGrant[]) => void;
  loadEvent: (event: CalendarEvent | null) => void;
  reset: () => void;
  validateAndGetEvent: () =>
    | {
        event: CalendarEvent;
        permissions: PermissionGrant[];
        initialPermissions: PermissionGrant[];
        error: null;
      }
    | { event: null; permissions: []; initialPermissions: []; error: string };
}

// Helper function for formatting time
const formatTimeForInput = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = Math.floor(date.getMinutes() / 15) * 15;
  return `${hours}:${minutes.toString().padStart(2, "0")}`;
};

const getDefaultFormFieldsState = (): FormFields => ({
  title: "",
  description: "",
  startDate: new Date(),
  endDate: new Date(),
  startTime: `${DEFAULT_START_HOUR}:00`,
  endTime: `${DEFAULT_END_HOUR}:00`,
  recurrenceRule: null,
  allDay: false,
  location: "",
  color: "sky" as EventColor,
  selectedTagIds: [],
  permissions: [],
  error: null,
});

const getDefaultEventMetadata = (): EventMetadata => ({
  eventId: null,
  source: "asksync" as const,
  externalId: undefined,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  canEdit: undefined,
  canDelete: undefined,
  canEditTags: undefined,
  initialPermissions: [],
});

export const useEventDialogStore = create<EventDialogState>((set, get) => ({
  isOpen: false,
  formFields: getDefaultFormFieldsState(),
  eventMetadata: getDefaultEventMetadata(),
  eventToUpdate: null,

  // Computed values
  get isExternalEvent() {
    const state = get();
    return state.eventMetadata.source !== "asksync";
  },
  get canOnlyEditTags() {
    const state = get();
    return state.isExternalEvent && state.eventMetadata.canEditTags === true;
  },
  get canDeleteEvent() {
    const state = get();
    return state.eventMetadata.canDelete !== false && !state.isExternalEvent;
  },

  setFormFields: (fields) =>
    set((state) => {
      const update: Partial<FormFields> = { ...fields };
      if (update.startDate && state.formFields.endDate < update.startDate) {
        update.endDate = update.startDate;
      }
      if (update.endDate || update.startDate) {
        update.error = null;
      }
      return {
        formFields: { ...state.formFields, ...update },
      };
    }),
  setEventMetadata: (metadata) =>
    set((state) => ({
      eventMetadata: { ...state.eventMetadata, ...metadata },
    })),

  toggleTagId: (tagId) =>
    set((state) => {
      const selectedTagIds = state.formFields.selectedTagIds.includes(tagId)
        ? state.formFields.selectedTagIds.filter((id) => id !== tagId)
        : [...state.formFields.selectedTagIds, tagId];
      return {
        formFields: { ...state.formFields, selectedTagIds },
      };
    }),

  setPermissions: (permissions) =>
    set((state) => ({
      formFields: { ...state.formFields, permissions },
    })),

  loadEvent: (event) =>
    set(() => {
      if (!event) {
        return {
          formFields: getDefaultFormFieldsState(),
          eventMetadata: getDefaultEventMetadata(),
        };
      }

      const start = new Date(event.start);
      const end = new Date(event.end);

      const formFields: FormFields = {
        ...getDefaultFormFieldsState(),
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
        recurrenceRule: event.recurrenceRule || null,
        permissions: event.permissions || [],
      };

      const eventMetadata: EventMetadata = {
        eventId: event.id,
        source: event.source || "asksync",
        externalId: event.externalId,
        timezone:
          event.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        canEdit: event.canEdit,
        canDelete: event.canDelete,
        canEditTags: event.canEditTags,
        initialPermissions: event.permissions || [],
      };

      return { formFields, eventMetadata, eventToUpdate: event };
    }),

  open: (event) => {
    get().loadEvent(event);
    set({ isOpen: true });
  },

  close: () => {
    get().reset();
    set({ isOpen: false });
  },

  reset: () =>
    set({
      formFields: getDefaultFormFieldsState(),
      eventMetadata: getDefaultEventMetadata(),
      eventToUpdate: null,
    }),

  validateAndGetEvent: () => {
    const state = get();
    const formFields = state.formFields;
    const eventMetadata = state.eventMetadata;
    const start = new Date(formFields.startDate);
    const end = new Date(formFields.endDate);

    if (formFields.allDay) {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }

    if (!formFields.allDay) {
      const [startHours = 0, startMinutes = 0] = formFields.startTime
        .split(":")
        .map(Number);
      const [endHours = 0, endMinutes = 0] = formFields.endTime
        .split(":")
        .map(Number);

      if (
        startHours < START_HOUR ||
        startHours > END_HOUR ||
        endHours < START_HOUR ||
        endHours > END_HOUR
      ) {
        const error = `Selected time must be between ${START_HOUR}:00 and ${END_HOUR}:00`;
        set({ formFields: { ...formFields, error } });
        return { event: null, permissions: [], initialPermissions: [], error };
      }
      start.setHours(startHours, startMinutes, 0);
      end.setHours(endHours, endMinutes, 0);
    }

    if (end < start) {
      const error = "End date cannot be before start date";
      set({ formFields: { ...formFields, error } });
      return { event: null, permissions: [], initialPermissions: [], error };
    }

    // Use generic title if empty
    const eventTitle = formFields.title.trim()
      ? formFields.title
      : "(no title)";

    const event: CalendarEvent = {
      start,
      end,
      id: eventMetadata.eventId || "",
      title: eventTitle,
      description: formFields.description,
      allDay: formFields.allDay,
      location: formFields.location,
      color: formFields.color,
      tagIds: formFields.selectedTagIds,
      recurrenceRule: formFields.recurrenceRule,
      source: eventMetadata.source,
      externalId: eventMetadata.externalId,
      timezone: eventMetadata.timezone,
      canEdit: eventMetadata.canEdit,
      canDelete: eventMetadata.canDelete,
      canEditTags: eventMetadata.canEditTags,
      permissions: formFields.permissions,
    };

    set({ formFields: { ...formFields, error: null } });
    return {
      event,
      permissions: formFields.permissions,
      initialPermissions: eventMetadata.initialPermissions,
      error: null,
    };
  },
}));
