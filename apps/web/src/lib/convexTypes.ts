// Utility types and functions for mapping between Convex and domain types

import { Doc, Id } from "@convex/dataModel";
import {
  Message,
  NotificationTime,
  PermissionGrant,
  Question,
  RecurrenceRule,
  Tag,
  Task,
  Thread,
  Timeblock,
  UserSettings,
} from "@asksync/shared";

import { CalendarEvent } from "@/schedule";
import { FunctionReturnType } from "convex/server";
import { api } from "@convex/api";

type TagType = Doc<"tags"> & {
  permissions: PermissionGrant[];
  canEdit?: boolean;
  canManage?: boolean;
  fastestAnswerMinutes?: number;
  availableTimeblockCount?: number;
};

export function docToTag(doc: TagType): Tag {
  const { _id, _creationTime, ...rest } = doc;
  return {
    id: _id,
    createdAt: _creationTime,
    ...rest,
  };
}

type TimeblockType = Doc<"timeblocks"> & {
  permissions: PermissionGrant[];
  canEdit?: boolean;
  canManage?: boolean;
  tasks: Doc<"tasks">[] | null;
  isBusy?: boolean;
  googleEmail?: string;
};

export function docToTimeblock(doc: TimeblockType): Timeblock {
  const { _id, _creationTime, recurrenceRule, exceptionDates, tasks, ...rest } =
    doc;
  return {
    id: _id,
    createdAt: _creationTime,
    recurrenceRule: recurrenceRule as RecurrenceRule,
    exceptionDates: exceptionDates || [],
    tasks: tasks ? tasks.map(docToTask) : null,
    ...rest,
  };
}

export function docToCalendarEvent(doc: TimeblockType): CalendarEvent {
  const {
    _id,
    recurrenceRule,
    startTime,
    endTime,
    color,
    tasks,
    isBusy,
    ...rest
  } = doc;

  return {
    id: _id,
    recurrenceRule: recurrenceRule as RecurrenceRule,
    start: new Date(startTime),
    end: new Date(endTime),
    color: color as CalendarEvent["color"],
    tasks: tasks ? tasks.map(docToTask) : [],
    isBusy: isBusy ?? false,
    ...rest,
  };
}

export function convertConvexQuestions(
  data: FunctionReturnType<
    typeof api.questions.queries.listQuestionsByUser
  >["questions"],
): Question[] {
  return data.map((doc) => {
    const { _id, _creationTime, tags, ...rest } = doc;
    const convertedTags: Tag[] = tags
      .map((tag) => (tag ? docToTag(tag) : null))
      .filter((tag): tag is Tag => tag !== null);

    return {
      id: _id,
      createdAt: _creationTime,
      tags: convertedTags,
      ...rest,
    };
  });
}

export function convertConvexQuestion(
  doc: FunctionReturnType<typeof api.questions.queries.getQuestionById>,
): Omit<Question, "messageCount" | "hasUnread"> {
  const { _id, _creationTime, tags, ...rest } = doc;

  const convertedTags: Tag[] = tags
    .map((tag) => (tag ? docToTag(tag) : null))
    .filter((tag): tag is Tag => tag !== null);

  return {
    id: _id,
    createdAt: _creationTime,
    tags: convertedTags,
    ...rest,
  };
}

export function docToTask(doc: Doc<"tasks">): Task {
  const { _id, ...rest } = doc;
  return {
    id: _id,
    ...rest,
  };
}

export function docToThread(doc: Doc<"threads">): Thread {
  const { _id, _creationTime, ...rest } = doc;
  return {
    id: _id,
    createdAt: _creationTime,
    ...rest,
  };
}

export function docToMessage(doc: Doc<"messages">): Message {
  const { _id, _creationTime, ...rest } = doc;
  return {
    id: _id,
    createdAt: _creationTime,
    ...rest,
  };
}

export function docToUserSettings(doc: Doc<"userSettings">): UserSettings {
  const { _id, _creationTime, defaultNotificationTime, ...rest } = doc;

  return {
    id: _id,
    createdAt: _creationTime,
    defaultNotificationTime: defaultNotificationTime as NotificationTime,
    ...rest,
  };
}

function toConvexId<
  T extends
    | "tags"
    | "timeblocks"
    | "questions"
    | "threads"
    | "messages"
    | "userSettings"
    | "userGroups"
    | "groupMembers"
    | "permissions"
    | "tasks",
>(id: string): Id<T> {
  return id as Id<T>;
}

export const toTagId = (id: string) => toConvexId<"tags">(id);
export const toTimeblockId = (id: string) => toConvexId<"timeblocks">(id);
export const toQuestionId = (id: string) => toConvexId<"questions">(id);
export const toThreadId = (id: string) => toConvexId<"threads">(id);
export const toMessageId = (id: string) => toConvexId<"messages">(id);
export const toUserSettingsId = (id: string) => toConvexId<"userSettings">(id);
export const toGroupId = (id: string) => toConvexId<"userGroups">(id);
export const toGroupMemberId = (id: string) => toConvexId<"groupMembers">(id);
export const toTaskId = (id: string) => toConvexId<"tasks">(id);

export const toPermissionId = (id: string) => toConvexId<"permissions">(id);
