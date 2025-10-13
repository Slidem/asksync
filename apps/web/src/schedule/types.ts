import { RecurrenceRule } from "@asksync/shared";

export type CalendarView = "month" | "week" | "day" | "agenda";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: EventColor;
  location?: string;
  tagIds?: string[];
  isRecurring?: boolean;
  recurrenceRule?: RecurrenceRule;
  source?: "asksync" | "google" | "outlook";
  externalId?: string;
  timezone?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  canEditTags?: boolean;
}

export type EventColor =
  | "sky"
  | "amber"
  | "violet"
  | "rose"
  | "emerald"
  | "orange";
