import { Button } from "@/components/ui/button";
import { Pause } from "lucide-react";
import React from "react";
import { usePauseSession } from "@/work/hooks/sessionControls";

export const PauseSession = () => {
  const handlePause = usePauseSession();

  return (
    <Button
      size="lg"
      variant="outline"
      onClick={handlePause}
      className="px-6 py-6 text-lg font-semibold hover:scale-105 transition-all"
    >
      <Pause className="mr-2 h-6 w-6" />
      Pause
    </Button>
  );
};
