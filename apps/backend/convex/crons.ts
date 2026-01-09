import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Recalculate expected answer times hourly for all pending items (questions + emails)
// This serves as a safety net to catch any missed updates from mutation triggers
crons.interval(
  "recalculate-expected-times",
  { hours: 1 },
  internal.common.recalculation.recalculateAllPendingItems,
  {},
);

// Google Calendar: Refresh expiring webhooks (every 6 days, webhooks expire in 7)
crons.interval(
  "refresh-calendar-webhooks",
  { hours: 144 }, // 6 days
  internal.googleCalendar.sync.refreshExpiringWebhooks,
  {},
);

// Google Calendar: Backup full sync (daily at 3 AM UTC)
crons.daily(
  "google-calendar-backup-sync",
  { hourUTC: 3, minuteUTC: 0 },
  internal.googleCalendar.sync.backupFullSync,
  {},
);

// Google Calendar: Refresh expiring tokens (every 30 minutes)
crons.interval(
  "refresh-calendar-tokens",
  { minutes: 30 },
  internal.googleCalendar.sync.refreshExpiringTokens,
  {},
);

// Gmail: Sync all connections (every 10 minutes)
crons.interval(
  "gmail-sync",
  { minutes: 10 },
  internal.gmail.sync.performSync,
  {},
);

// Gmail: Refresh expiring tokens (every 30 minutes)
crons.interval(
  "gmail-refresh-tokens",
  { minutes: 30 },
  internal.gmail.sync.refreshExpiringTokens,
  {},
);

export default crons;
