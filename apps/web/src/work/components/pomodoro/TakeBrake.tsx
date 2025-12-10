import { Button } from "@/components/ui/button";
import React from "react";
import { SkipForward } from "lucide-react";
import { useTakeBreak } from "@/work/hooks/sessionControls";

export const TakeBrake = () => {
  const handleTakeBreak = useTakeBreak();

  return (
    <Button
      size="lg"
      variant="outline"
      onClick={handleTakeBreak}
      className="px-6 py-6 text-lg font-semibold hover:scale-105 transition-all"
    >
      <SkipForward className="mr-2 h-6 w-6" />
      Take Break
    </Button>
  );
};
