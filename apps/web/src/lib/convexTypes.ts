// Utility types and functions for mapping between Convex and domain types

import { Doc, Id } from "@convex/dataModel";
import {
  Message,
  NotificationTime,
  PermissionGrant,
  Question,
  RecurrenceRule,
  Tag,
  Thread,
  Timeblock,
  UserSettings,
} from "@asksync/shared";

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
};

export function docToTimeblock(doc: TimeblockType): Timeblock {
  const { _id, _creationTime, recurrenceRule, exceptionDates, ...rest } = doc;
  return {
    id: _id,
    createdAt: _creationTime,
    recurrenceRule: recurrenceRule as RecurrenceRule,
    exceptionDates: exceptionDates || [],
    ...rest,
  };
}

export function convertConvexQuestions(
  data: FunctionReturnType<typeof api.questions.listQuestionsByUser>,
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
  doc: FunctionReturnType<typeof api.questions.getQuestionById>,
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
    | "permissions",
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

export const toPermissionId = (id: string) => toConvexId<"permissions">(id);
