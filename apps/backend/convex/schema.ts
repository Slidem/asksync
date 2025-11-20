/* eslint-disable import/order */
import { defineSchema, defineTable } from "convex/server";

import { v } from "convex/values";

export default defineSchema({
  tags: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    color: v.string(),
    answerMode: v.union(v.literal("on-demand"), v.literal("scheduled")),
    responseTimeMinutes: v.optional(v.number()),
    orgId: v.string(),
    createdBy: v.string(),
    isPublic: v.optional(v.boolean()), // Deprecated: use permissions instead
    updatedAt: v.number(),
  })
    .index("by_org", ["orgId"])
    .index("by_org_and_name", ["orgId", "name"])
    .index("by_org_and_creator", ["orgId", "createdBy"]),

  timeblocks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.number(),
    timezone: v.string(),
    recurrenceRule: v.optional(
      v.union(
        v.null(),
        v.literal("FREQ=DAILY"),
        v.literal("FREQ=WEEKLY"),
        v.literal("FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR"),
      ),
    ),
    tagIds: v.array(v.string()), // which tags this timeblock handles
    createdBy: v.string(),
    orgId: v.string(),
    source: v.union(
      v.literal("asksync"),
      v.literal("google"),
      v.literal("outlook"),
    ),
    externalId: v.optional(v.string()),
    color: v.optional(v.string()),
    exceptionDates: v.optional(v.array(v.number())), // UTC midnight timestamps of excluded dates
    updatedAt: v.number(),
  })
    .index("by_org_and_creator", ["orgId", "createdBy"])
    .index("by_org_and_time", ["orgId", "startTime"])
    .index("by_tag_ids", ["tagIds"])
    .index("by_external_id", ["externalId"]),

  // Questions - the core inquiry entities
  questions: defineTable({
    // Content
    title: v.string(),
    content: v.string(),

    // Assignment and participation
    createdBy: v.string(),
    participantIds: v.array(v.string()), // all users who can view/comment (includes creator and assignees)
    assigneeIds: v.array(v.string()), // subset of participants responsible for answering
    orgId: v.string(),

    // Categorization
    tagIds: v.array(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("answered"),
      v.literal("resolved"),
    ),

    // Answer management
    acceptedAnswers: v.array(v.string()), // messageIds that are marked as accepted answers
    manualAnswer: v.optional(v.string()), // direct answer text (alternative to message selection)
    manualAnswerBy: v.optional(v.string()), // userId who added manual answer
    manualAnswerAt: v.optional(v.number()), // timestamp of manual answer

    // Timing and urgency
    updatedAt: v.number(),
    expectedAnswerTime: v.number(), // calculated from tags, when answer is expected
    isOverdue: v.boolean(), // whether question is past expected answer time
    answeredAt: v.optional(v.number()), // when first answer was provided

    // Read status tracking
    unreadBy: v.array(v.string()), // userIds who haven't seen latest updates

    // Relationships
    threadId: v.string(), // thread is created immediately with question
  })
    .index("by_org", ["orgId"])
    .index("by_org_and_creator", ["orgId", "createdBy"])
    .index("by_org_and_status", ["orgId", "status"])
    .index("by_org_and_expected_time", ["orgId", "expectedAnswerTime"])
    .index("by_org_and_overdue", ["orgId", "isOverdue"]),

  // Question Threads - conversation containers
  threads: defineTable({
    // Basic properties
    questionId: v.string(), // the original question
    orgId: v.string(),

    // Participants
    participants: v.array(v.string()), // userIds in the conversation
    status: v.union(
      v.literal("active"),
      v.literal("resolved"),
      v.literal("archived"),
    ),

    // Metadata
    updatedAt: v.number(),
    lastMessageAt: v.optional(v.number()),
  })
    .index("by_org", ["orgId"])
    .index("by_question", ["questionId"])
    .index("by_org_and_participants", ["orgId", "participants"])
    .index("by_org_and_status", ["orgId", "status"]),

  // Messages - individual communications within threads
  messages: defineTable({
    // Content
    content: v.string(),
    messageType: v.union(v.literal("text"), v.literal("system")),
    attachments: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        url: v.string(),
        size: v.number(),
        mimeType: v.string(),
      }),
    ),

    // Attribution
    threadId: v.string(),
    createdBy: v.string(),
    orgId: v.string(),

    // Accepted answer tracking
    isAcceptedAnswer: v.boolean(), // whether this message is marked as an accepted answer
    acceptedBy: v.optional(v.string()), // userId who marked this as accepted
    acceptedAt: v.optional(v.number()), // timestamp when marked as accepted

    // State
    isDeleted: v.boolean(),
    editedAt: v.optional(v.number()),
  })
    .index("by_thread", ["threadId"])
    .index("by_org_and_user", ["orgId", "createdBy"])
    .index("by_thread_and_accepted", ["threadId", "isAcceptedAnswer"]),

  // User Settings - per-user, per-organization configuration
  userSettings: defineTable({
    // Identity
    userId: v.string(),
    orgId: v.string(),

    // Notification preferences
    defaultNotificationTime: v.string(), // "end-of-day", "immediate", "custom"
    customNotificationTime: v.optional(v.string()), // "09:00" format
    batchingEnabled: v.boolean(),
    quietHoursStart: v.optional(v.string()), // "22:00" format
    quietHoursEnd: v.optional(v.string()), // "08:00" format

    // Preferences
    timezone: v.string(), // IANA timezone
    defaultResponseTime: v.number(), // minutes

    // Integration settings
    connectedCalendars: v.array(
      v.object({
        provider: v.string(), // "google", "outlook"
        accountId: v.string(),
        isEnabled: v.boolean(),
        syncSettings: v.object({
          autoCreateTimeblocks: v.boolean(),
          defaultTagIds: v.array(v.string()),
        }),
      }),
    ),

    // Metadata
    updatedAt: v.number(),
  })
    .index("by_user_and_org", ["userId", "orgId"])
    .index("by_org", ["orgId"]),

  // User Groups - groups for organizing members and permissions
  userGroups: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    color: v.string(), // hex color for UI
    orgId: v.string(),
    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_org", ["orgId"])
    .index("by_org_and_name", ["orgId", "name"]),

  // Group Members - membership of users in groups
  groupMembers: defineTable({
    groupId: v.string(),
    userId: v.string(),
    orgId: v.string(),
    addedBy: v.string(),
    addedAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_user_and_org", ["userId", "orgId"])
    .index("by_org", ["orgId"]),

  // Permissions - assigned to groups or individual users
  // Either groupId OR userId must be set (not both)
  permissions: defineTable({
    all: v.optional(v.boolean()), // if true, permission applies to all users in the org
    groupId: v.optional(v.string()), // if set, permission is for a group
    userId: v.optional(v.string()), // if set, permission is for an individual user
    orgId: v.string(),
    resourceType: v.union(
      v.literal("tags"),
      v.literal("timeblocks"),
      v.literal("questions"),
    ),
    resourceId: v.string(),
    permission: v.union(
      v.literal("view"),
      v.literal("edit"),
      v.literal("manage"),
    ),
    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_user", ["userId"])
    .index("by_resource", ["resourceType", "resourceId"])
    .index("by_org", ["orgId"])
    .index("by_org_and_type", ["orgId", "resourceType"])
    .index("by_org_and_type_and_resourceId", [
      "orgId",
      "resourceType",
      "resourceId",
    ])
    .index("by_user_and_org", ["userId", "orgId"]),
});
