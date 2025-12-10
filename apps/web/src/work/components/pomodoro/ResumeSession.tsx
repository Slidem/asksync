import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useResume } from "@/work/hooks/sessionControls";
import { useSessionColor } from "@/work/hooks/sessionUtils";

export const ResumeSession = () => {
  const handleResume = useResume();
  const sessionColor = useSessionColor();

  return (
    <Button
      size="lg"
      onClick={handleResume}
      className={cn(
        "px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all",
        "bg-gradient-to-r text-white hover:scale-105",
        sessionColor,
      )}
    >
      <Play className="mr-2 h-6 w-6" />
      Resume
    </Button>
  );
};
