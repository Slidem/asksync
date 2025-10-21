import { addMinutes, differenceInMinutes } from "date-fns";

/**
 * Snaps a time value to the nearest 15-minute interval
 */
export function snapToQuarterHour(time: number): number {
  const hours = Math.floor(time);
  const fractionalHour = time - hours;

  let minutes = 0;
  if (fractionalHour < 0.125) minutes = 0;
  else if (fractionalHour < 0.375) minutes = 15;
  else if (fractionalHour < 0.625) minutes = 30;
  else minutes = 45;

  return hours + minutes / 60;
}

/**
 * Converts fractional hour to minutes
 */
export function fractionalHourToMinutes(fractionalHour: number): number {
  if (fractionalHour < 0.125) return 0;
  if (fractionalHour < 0.375) return 15;
  if (fractionalHour < 0.625) return 30;
  return 45;
}

/**
 * Creates a new date with snapped time from fractional hour
 */
export function createDateWithSnappedTime(
  date: Date,
  time: number,
): Date {
  const newDate = new Date(date);
  const hours = Math.floor(time);
  const minutes = fractionalHourToMinutes(time - hours);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
}

/**
 * Checks if two dates have the same date and time (down to minutes)
 */
export function isSameDateTime(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate() &&
    date1.getHours() === date2.getHours() &&
    date1.getMinutes() === date2.getMinutes()
  );
}

/**
 * Checks if two dates have the same date (ignoring time)
 */
export function isSameDate(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Calculates new end time based on original duration
 */
export function calculateNewEndTime(
  originalStart: Date,
  originalEnd: Date,
  newStart: Date,
): Date {
  const durationMinutes = differenceInMinutes(originalEnd, originalStart);
  return addMinutes(newStart, durationMinutes);
}

/**
 * Preserves time from source date and applies to target date
 */
export function preserveTime(sourceDate: Date, targetDate: Date): Date {
  const result = new Date(targetDate);
  result.setHours(
    sourceDate.getHours(),
    sourceDate.getMinutes(),
    sourceDate.getSeconds(),
    sourceDate.getMilliseconds(),
  );
  return result;
}

/**
 * Snaps a Date to the nearest 15-minute interval (mutates the date)
 * @param date - The date to snap
 * @returns The same date object (mutated)
 */
export function snapToQuarterHourMutate(date: Date): Date {
  const minutes = date.getMinutes();
  const remainder = minutes % 15;

  if (remainder !== 0) {
    if (remainder < 7.5) {
      date.setMinutes(minutes - remainder);
    } else {
      date.setMinutes(minutes + (15 - remainder));
    }
    date.setSeconds(0);
    date.setMilliseconds(0);
  }

  return date;
}

/**
 * Formats time with optional minutes (e.g., "2pm" or "2:30pm")
 * @param date - The date to format
 * @returns Formatted time string in lowercase
 */
export function formatTimeWithOptionalMinutes(date: Date): string {
  const minutes = date.getMinutes();
  const hours = date.getHours();
  const isPM = hours >= 12;
  const displayHours = hours % 12 || 12;

  if (minutes === 0) {
    return `${displayHours}${isPM ? 'pm' : 'am'}`;
  }

  return `${displayHours}:${minutes.toString().padStart(2, '0')}${isPM ? 'pm' : 'am'}`;
}
