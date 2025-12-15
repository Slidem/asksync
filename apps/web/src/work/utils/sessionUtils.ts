import { useWorkModeStore } from "@/work/stores/workModeStore";

export const useSessionColor = () => {
  const sessionType = useWorkModeStore((state) => state.sessionType);
  return getSessionColor(sessionType);
}; /**
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
