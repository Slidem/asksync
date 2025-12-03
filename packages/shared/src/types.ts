export type AnswerMode = "on-demand" | "scheduled";

export type QuestionStatus =
  | "pending"
  | "assigned"
  | "in_progress"
  | "answered"
  | "resolved";

export type ThreadStatus = "active" | "resolved" | "archived";

export type MessageType = "text" | "system";

export type CalendarSource = "asksync" | "google" | "outlook";

export type NotificationTime = "end-of-day" | "immediate" | "custom";

export enum RecurrenceRule {
  DAILY = "FREQ=DAILY",
  WEEKLY = "FREQ=WEEKLY",
  WEEKDAYS = "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR",
}

// === ENTITY TYPES ===
export interface Tag {
  id: string;
  name: string;
  description?: string;
  color: string;
  answerMode: AnswerMode;
  responseTimeMinutes?: number;
  fastestAnswerMinutes?: number;
  availableTimeblockCount?: number;
  questionCount?: number;
  timeblockCount?: number;
  orgId: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  permissions: PermissionGrant[];
  canEdit?: boolean;
  canManage?: boolean;
}

export interface Timeblock {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startTime: number;
  endTime: number;
  timezone: string;
  recurrenceRule?: RecurrenceRule | null;
  tagIds: string[];
  createdBy: string;
  orgId: string;
  source: CalendarSource;
  externalId?: string; // ID from external calendar
  color?: string;
  exceptionDates?: number[]; // UTC midnight timestamps of excluded dates
  checklistsVisible?: boolean; // whether non-owners can see checklists
  createdAt: number;
  updatedAt: number;
  permissions: PermissionGrant[];
  taskCount?: { total: number; completed: number } | null;
}

export interface Question {
  id: string;
  title: string;
  content: string;
  contentPlaintext?: string;
  createdBy: string;
  participantIds: string[];
  participants?: { id: string; isAssignee: boolean; isCreator: boolean }[];
  assigneeIds: string[];
  orgId: string;
  tags: Tag[];
  status: QuestionStatus;
  acceptedAnswers: string[];
  manualAnswer?: string;
  manualAnswerPlaintext?: string;
  manualAnswerBy?: string;
  manualAnswerAt?: number;
  createdAt: number;
  updatedAt: number;
  expectedAnswerTime: number;
  isOverdue: boolean;
  answeredAt?: number;
  unreadBy: string[];
  threadId: string;
  messageCount: number;
  hasUnread: boolean;
}

export interface Thread {
  id: string;
  questionId: string; // the original question
  orgId: string;
  participants: string[]; // userIds in the conversation
  status: ThreadStatus;
  createdAt: number;
  updatedAt: number;
  lastMessageAt?: number;
}

export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface Message {
  id: string;
  content: string;
  contentPlaintext?: string;
  messageType: MessageType;
  attachments: MessageAttachment[];
  threadId: string;
  createdBy: string; // sender
  orgId: string;
  isAcceptedAnswer: boolean; // whether this message is marked as an accepted answer
  acceptedBy?: string; // userId who marked this as accepted
  acceptedAt?: number; // timestamp when marked as accepted
  isDeleted: boolean;
  editedAt?: number;
  createdAt: number;
}

export interface CalendarIntegration {
  provider: string; // "google", "outlook"
  accountId: string;
  isEnabled: boolean;
  syncSettings: {
    autoCreateTimeblocks: boolean;
    defaultTagIds: string[];
  };
}

export interface UserSettings {
  id: string;
  userId: string;
  orgId: string;
  defaultNotificationTime: NotificationTime;
  customNotificationTime?: string; // "09:00" format
  batchingEnabled: boolean;
  quietHoursStart?: string; // "22:00" format
  quietHoursEnd?: string; // "08:00" format
  timezone: string; // IANA timezone
  defaultResponseTime: number; // minutes
  connectedCalendars: CalendarIntegration[];
  createdAt: number;
  updatedAt: number;
}

export interface CreateTagForm {
  name: string;
  description?: string;
  color: string;
  answerMode: AnswerMode;
  responseTimeMinutes?: number;
}

export interface UpdateTagForm {
  name?: string;
  description?: string;
  color?: string;
  answerMode?: AnswerMode;
  responseTimeMinutes?: number;
}

export interface CreateQuestionForm {
  title: string;
  content: string;
  contentPlaintext?: string;
  tagIds: string[];
  assigneeIds: string[];
  participants?: string[];
}

export type PermissionLevel = "view" | "edit" | "manage";

export interface PermissionGrant {
  id: string;
  type: "user" | "group" | "all";
  userId?: string;
  groupId?: string;
  permission: PermissionLevel;
  isCreator?: boolean;
}

export interface QuestionFilters {
  search?: string;
  status?: "unanswered" | "ongoing" | "answered" | "all";
  tagIds?: string[];
  sortBy?: "expectedTime" | "createdAt" | "updatedAt";
}

// === COLOR CONSTANTS ===
export const TAG_COLORS = [
  "#ef4444", // red-500
  "#f97316", // orange-500
  "#eab308", // yellow-500
  "#22c55e", // green-500
  "#06b6d4", // cyan-500
  "#3b82f6", // blue-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#64748b", // slate-500
] as const;

// === PREDEFINED VALUES ===
export const RESPONSE_TIME_OPTIONS = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
  { value: 120, label: "2 hours" },
  { value: 240, label: "4 hours" },
  { value: 480, label: "8 hours" },
  { value: 1440, label: "1 day" },
] as const;
