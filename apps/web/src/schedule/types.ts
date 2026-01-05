import {
  CalendarSource,
  PermissionGrant,
  RecurrenceRule,
  Task,
} from "@asksync/shared";

export enum CalendarView {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
  AGENDA = "agenda",
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: EventColor;
  location?: string;
  tagIds: string[];
  recurrenceRule?: RecurrenceRule | null;
  source?: CalendarSource;
  externalId?: string;
  timezone?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  canEditTags?: boolean;
  permissions: PermissionGrant[];
  checklistsVisible?: boolean;
  tasks: Task[];
  // Google Calendar sync
  syncToGoogle?: boolean;
  googleEventId?: string;
  googleConnectionId?: string;
  googleSyncStatus?: "synced" | "pending" | "error";
  // Busy block (when user lacks view permission)
  isBusy?: boolean;
}

export type EventColor =
  | "sky"
  | "amber"
  | "violet"
  | "rose"
  | "emerald"
  | "orange";
export interface TimeOption {
  value: string;
  label: string;
}

export interface PositionedEvent {
  event: CalendarEvent;
  top: number;
  height: number;
  left: number;
  width: number;
  zIndex: number;
}
export interface GhostEventPosition {
  top: number;
  height: number;
  left?: number | string;
  right?: number | string;
  width?: string;
}
