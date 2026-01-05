import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Recalculate expected answer times hourly for all pending/assigned questions
// This serves as a safety net to catch any missed updates from mutation triggers
crons.interval(
  "recalculate-expected-times",
  { hours: 1 },
  internal.questions.recalculation.recalculateAllPendingQuestions,
  {},
);

// Google Calendar: Refresh expiring webhooks (every 6 days, webhooks expire in 7)
crons.interval(
  "refresh-google-webhooks",
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
  "refresh-google-tokens",
  { minutes: 30 },
  internal.googleCalendar.sync.refreshExpiringTokens,
  {},
);

export default crons;
