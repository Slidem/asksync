import { useMemo } from "react";

export const formatResponseTime = (minutes?: number) => {
  if (!minutes) return null;

  if (minutes < 60) {
    return `${minutes}m`;
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  } else {
    const days = Math.floor(minutes / 1440);
    return `${days}d`;
  }
};

export const useOneWeekDateRange = () => {
  return useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);
    start.setDate(start.getDate() - 1);
    end.setDate(end.getDate() + 7);
    return {
      startDate: start.getTime(),
      endDate: end.getTime(),
    };
  }, []);
};

/**
 *
 *  Format date in epoch milliseconds to "HH:mm" format
 * Example: 1672531199000 -> "14:59"
 *
 * @param dateInEpochMillis
 * @returns
 */
export function formatDateToHHmmTime(dateInEpochMillis: number): string {
  const date = new Date(dateInEpochMillis);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Format milliseconds to MM:SS display
 * Example: 125000 ms -> "02:05"
 */
export function formatMillisecondsToTimeDuration(durationInMs: number): string {
  const totalSeconds = Math.floor(durationInMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}
/**
 * Format duration to human-readable string
 * Example: 6500000 ms -> "1h 48m"
 */

export function formatDurationHumanReadableString(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
