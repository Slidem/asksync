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

export default crons;
