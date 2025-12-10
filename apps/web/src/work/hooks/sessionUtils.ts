import { getSessionColor } from "@/work/utils/formatting";
import { useWorkModeStore } from "@/work/stores/workModeStore";

export const useSessionColor = () => {
  const sessionType = useWorkModeStore((state) => state.sessionType);
  return getSessionColor(sessionType);
};
