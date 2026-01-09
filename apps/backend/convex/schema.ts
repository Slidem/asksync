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
    googleConnectionId: v.optional(v.id("googleCalendarConnections")), // tracks which Google account synced this event
    color: v.optional(v.string()),
    exceptionDates: v.optional(v.array(v.number())), // UTC midnight timestamps of excluded dates
    checklistsVisible: v.optional(v.boolean()), // whether non-owners can see checklists
    updatedAt: v.number(),
  })
    .index("by_org_and_creator", ["orgId", "createdBy"])
    .index("by_org_and_creator_and_startTime_and_endTime", [
      "orgId",
      "createdBy",
      "startTime",
      "endTime",
    ])
    .index("by_org_and_creator_and_source", ["orgId", "createdBy", "source"])
    .index("by_external_id", ["externalId"])
    .index("by_google_connection", ["googleConnectionId"]),

  // Tasks - checklist items for timeblocks
  tasks: defineTable({
    timeblockId: v.id("timeblocks"),
    title: v.string(),
    completed: v.boolean(),
    order: v.number(),
    currentlyWorkingOn: v.boolean(),
    orgId: v.string(),
    createdBy: v.string(),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_timeblock", ["timeblockId"])
    .index("by_org", ["orgId"]),

  // Questions - the core inquiry entities
  questions: defineTable({
    // Content
    title: v.string(),
    content: v.string(),
    contentPlaintext: v.optional(v.string()),

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
    manualAnswerPlaintext: v.optional(v.string()),
    manualAnswerBy: v.optional(v.string()), // userId who added manual answer
    manualAnswerAt: v.optional(v.number()), // timestamp of manual answer

    // Timing and urgency
    updatedAt: v.number(),
    expectedAnswerTime: v.number(), // calculated from tags, when answer is expected
    isOverdue: v.boolean(), // whether question is past expected answer time
    answeredAt: v.optional(v.number()), // when first answer was provided

    // Read status tracking
    unreadBy: v.array(v.string()), // userIds who haven't seen latest updates

    // Denormalized data
    messageCount: v.optional(v.number()), // total messages in thread (for performance)

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
    contentPlaintext: v.optional(v.string()),
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

  // Work Sessions - Pomodoro work sessions tracking
  workSessions: defineTable({
    userId: v.string(),
    orgId: v.string(),

    // Session type and context
    sessionType: v.union(
      v.literal("work"),
      v.literal("shortBreak"),
      v.literal("longBreak"),
    ),
    timeblockId: v.optional(v.id("timeblocks")),
    taskId: v.optional(v.union(v.id("tasks"), v.null())),
    questionId: v.optional(v.union(v.id("questions"), v.null())),

    // Timing (all in milliseconds)
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    pausedDuration: v.number(), // total pause time
    targetDuration: v.number(), // planned duration
    actualDuration: v.number(), // elapsed active time

    // Configuration
    focusMode: v.union(
      v.literal("deep"),
      v.literal("normal"),
      v.literal("quick"),
      v.literal("review"),
      v.literal("custom"),
    ),
    customDuration: v.optional(v.number()),

    // Progress tracking
    tasksCompleted: v.array(v.id("tasks")),
    questionsAnswered: v.array(v.id("questions")),

    // Status
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("skipped"),
    ),
    deviceId: v.string(),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_and_org", ["userId", "orgId"])
    .index("by_org", ["orgId"])
    .index("by_status", ["status"])
    .index("by_user_and_status", ["userId", "status"])
    .index("by_timeblock", ["timeblockId"]),

  // Pomodoro Settings - user preferences for work mode
  pomodoroSettings: defineTable({
    userId: v.string(),
    orgId: v.string(),

    // Default durations (in minutes)
    defaultWorkDuration: v.number(),
    defaultShortBreak: v.number(),
    defaultLongBreak: v.number(),
    sessionsBeforeLongBreak: v.number(),

    // Focus mode presets (durations in minutes)
    presets: v.object({
      deep: v.object({
        work: v.number(),
        shortBreak: v.number(),
        longBreak: v.number(),
      }),
      normal: v.object({
        work: v.number(),
        shortBreak: v.number(),
        longBreak: v.number(),
      }),
      quick: v.object({
        work: v.number(),
        shortBreak: v.number(),
        longBreak: v.number(),
      }),
      review: v.object({
        work: v.number(),
        shortBreak: v.number(),
        longBreak: v.number(),
      }),
    }),

    // User preferences
    autoStartBreaks: v.boolean(),
    autoStartWork: v.boolean(),
    soundEnabled: v.boolean(),
    notificationsEnabled: v.boolean(),
    currentFocusMode: v.union(
      v.literal("deep"),
      v.literal("normal"),
      v.literal("quick"),
      v.literal("review"),
      v.literal("custom"),
    ),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_and_org", ["userId", "orgId"])
    .index("by_org", ["orgId"]),

  // User Work Status - real-time work status for team visibility
  userWorkStatus: defineTable({
    userId: v.string(),
    orgId: v.string(),

    // Current status
    status: v.union(
      v.literal("working"),
      v.literal("break"),
      v.literal("paused"),
      v.literal("offline"),
    ),
    currentTaskId: v.optional(v.union(v.id("tasks"), v.null())),
    currentQuestionId: v.optional(v.union(v.id("questions"), v.null())),
    currentTimeblockId: v.optional(v.id("timeblocks")),

    // Session info
    sessionStartedAt: v.optional(v.number()),
    expectedEndAt: v.optional(v.number()),
    focusMode: v.string(),
    sessionType: v.union(
      v.literal("work"),
      v.literal("shortBreak"),
      v.literal("longBreak"),
    ),

    // Privacy
    shareDetails: v.boolean(), // whether to show task/question details

    // Timestamps
    lastUpdated: v.number(),
  })
    .index("by_user_and_org", ["userId", "orgId"])
    .index("by_org", ["orgId"])
    .index("by_status", ["status"]),

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

  // Gmail Connections - OAuth tokens and sync state per Gmail account
  gmailConnections: defineTable({
    userId: v.string(),
    orgId: v.string(),

    // Google account info
    googleAccountId: v.string(),
    googleEmail: v.string(),

    // OAuth tokens
    accessToken: v.string(),
    refreshToken: v.string(),
    tokenExpiresAt: v.number(),

    // Sync state
    lastHistoryId: v.optional(v.string()), // Gmail incremental sync marker
    lastSyncedAt: v.optional(v.number()),
    syncStatus: v.union(
      v.literal("active"),
      v.literal("error"),
      v.literal("disconnected"),
    ),
    lastErrorMessage: v.optional(v.string()),

    // Metadata
    isEnabled: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_and_org", ["userId", "orgId"])
    .index("by_org", ["orgId"])
    .index("by_google_account", ["googleAccountId"])
    .index("by_sync_status", ["syncStatus"]),

  // Email Conversion Rules - user-specific rules for email->attention item
  emailConversionRules: defineTable({
    userId: v.string(),
    orgId: v.string(),
    gmailConnectionId: v.id("gmailConnections"),

    // Rule name for display
    name: v.string(),

    // Match criteria (all optional, at least one required)
    senderPattern: v.optional(v.string()), // regex pattern
    subjectPattern: v.optional(v.string()), // regex pattern
    contentPattern: v.optional(v.string()), // regex pattern

    // Actions when rule matches
    autoTagIds: v.array(v.string()),

    // State
    isEnabled: v.boolean(),
    priority: v.number(), // higher = checked first

    // Stats
    matchCount: v.optional(v.number()),
    lastMatchedAt: v.optional(v.number()),

    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_and_org", ["userId", "orgId"])
    .index("by_gmail_connection", ["gmailConnectionId"])
    .index("by_org", ["orgId"]),

  // Email Attention Items - converted emails needing attention
  emailAttentionItems: defineTable({
    userId: v.string(),
    orgId: v.string(),
    gmailConnectionId: v.id("gmailConnections"),
    matchedRuleIds: v.array(v.id("emailConversionRules")),

    // Email info (denormalized for display)
    gmailMessageId: v.string(),
    gmailThreadId: v.string(),
    senderEmail: v.string(),
    senderName: v.optional(v.string()),
    subject: v.string(),
    snippet: v.string(),
    htmlBody: v.optional(v.string()), // full HTML content for email viewer
    receivedAt: v.number(),

    // State
    status: v.union(v.literal("pending"), v.literal("resolved")),
    resolvedAt: v.optional(v.number()),

    // Categorization
    tagIds: v.array(v.string()), // merged from all matching rules

    // Timing and urgency (same as questions)
    expectedAnswerTime: v.optional(v.number()),
    isOverdue: v.optional(v.boolean()),

    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_and_org", ["userId", "orgId"])
    .index("by_user_and_status", ["userId", "status"])
    .index("by_gmail_message", ["gmailMessageId"])
    .index("by_gmail_connection", ["gmailConnectionId"])
    .index("by_org", ["orgId"])
    .index("by_org_and_expected_time", ["orgId", "expectedAnswerTime"]),

  // Google Calendar Connections - OAuth tokens and sync state per account
  googleCalendarConnections: defineTable({
    userId: v.string(),
    orgId: v.string(),

    // Google account info
    googleAccountId: v.string(), // Google's unique user ID
    googleEmail: v.string(), // email for display

    // OAuth tokens
    accessToken: v.string(),
    refreshToken: v.string(),
    tokenExpiresAt: v.number(), // timestamp when access token expires

    // Visibility setting
    visibility: v.union(v.literal("public"), v.literal("hidden")),

    // Sync state
    syncToken: v.optional(v.string()), // Google incremental sync token
    lastSyncedAt: v.optional(v.number()), // last successful sync timestamp
    syncStatus: v.union(
      v.literal("active"),
      v.literal("error"),
      v.literal("disconnected"),
    ),
    lastErrorMessage: v.optional(v.string()),

    // Webhook state
    webhookChannelId: v.optional(v.string()),
    webhookResourceId: v.optional(v.string()),
    webhookExpiresAt: v.optional(v.number()),

    // Metadata
    isEnabled: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_and_org", ["userId", "orgId"])
    .index("by_org", ["orgId"])
    .index("by_google_account", ["googleAccountId"])
    .index("by_webhook_channel", ["webhookChannelId"])
    .index("by_sync_status", ["syncStatus"]),
});
