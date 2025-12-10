import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";
import { getSessionColor } from "@/work/utils/formatting";
import { useStartWork } from "@/work/hooks/sessionControls";
import { useWorkModeStore } from "@/work/stores/workModeStore";

export const StartFocus = () => {
  const sessionType = useWorkModeStore((state) => state.sessionType);
  const sessionColor = getSessionColor(sessionType);
  const handleStart = useStartWork();

  return (
    <div className="flex gap-4">
      <Button
        size="lg"
        onClick={handleStart}
        className={cn(
          "px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all",
          "bg-gradient-to-r text-white hover:scale-105",
          sessionColor,
        )}
      >
        <Play className="mr-2 h-6 w-6" />
        Start Focus
      </Button>
    </div>
  );
};
