/**
 * Format milliseconds to MM:SS display
 */
export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Format duration to human-readable string
 */
export function formatDuration(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Get session type color classes
 */
export function getSessionColor(sessionType: string): string {
  switch (sessionType) {
    case "work":
      return "from-blue-500 to-purple-600";
    case "shortBreak":
      return "from-green-500 to-emerald-600";
    case "longBreak":
      return "from-orange-500 to-amber-600";
    default:
      return "from-gray-500 to-gray-600";
  }
}

/**
 * Get session type label
 */
export function getSessionLabel(sessionType: string): string {
  switch (sessionType) {
    case "work":
      return "Work Session";
    case "shortBreak":
      return "Short Break";
    case "longBreak":
      return "Long Break";
    default:
      return "Session";
  }
}