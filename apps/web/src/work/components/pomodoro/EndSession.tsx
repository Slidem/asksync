import { Button } from "@/components/ui/button";
import React from "react";
import { Square } from "lucide-react";
import { useEndSession } from "@/work/hooks/sessionControls";

export const EndSession = () => {
  const handleEndSession = useEndSession();
  return (
    <Button
      size="lg"
      variant="destructive"
      onClick={handleEndSession}
      className="px-6 py-6 text-lg font-semibold hover:scale-105 transition-all"
    >
      <Square className="mr-2 h-6 w-6" />
      End
    </Button>
  );
};
