import { Doc } from "../../_generated/dataModel";

// Helper function to calculate streak
export function calculateStreak(sessions: Doc<"workSessions">[]): number {
  if (sessions.length === 0) return 0;

  // Sort sessions by date (newest first)
  const sortedSessions = [...sessions].sort(
    (a, b) => b.startedAt - a.startedAt,
  );

  let streak = 0;
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  // Check if there's a session today
  const todaySession = sortedSessions.find((s) => {
    const sessionDate = new Date(s.startedAt);
    sessionDate.setHours(0, 0, 0, 0);
    return sessionDate.getTime() === currentDate.getTime();
  });

  if (!todaySession) {
    // If no session today, check if there was one yesterday
    currentDate.setDate(currentDate.getDate() - 1);
    const yesterdaySession = sortedSessions.find((s) => {
      const sessionDate = new Date(s.startedAt);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === currentDate.getTime();
    });

    if (!yesterdaySession) return 0;
  }

  // Count consecutive days with sessions
  const dates = new Set<string>();
  sortedSessions.forEach((s) => {
    const date = new Date(s.startedAt).toISOString().split("T")[0];
    dates.add(date);
  });

  const sortedDates = Array.from(dates).sort().reverse();

  for (let i = 0; i < sortedDates.length; i++) {
    const expectedDate = new Date(currentDate);
    expectedDate.setDate(expectedDate.getDate() - i);
    const expected = expectedDate.toISOString().split("T")[0];

    if (sortedDates[i] === expected) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
