import { useEffect, useRef } from "react";

import { usePomodoroSettings } from "@/work/hooks/queries";
import { useWorkModeStore } from "@/work/stores/workModeStore";

export const useLoadPomodoroSettings = () => {
  const hasLoaded = useRef(false);
  const setSettingsToStore = useWorkModeStore((state) => state.setSettings);
  const { isLoading, settings } = usePomodoroSettings();

  useEffect(() => {
    if (hasLoaded.current) {
      return;
    }

    if (!isLoading && settings) {
      hasLoaded.current = true;
      setSettingsToStore(settings);
    }
  }, [isLoading, settings, setSettingsToStore]);
};
