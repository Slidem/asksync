import { Button } from "@/components/ui/button";
import { SkipForward } from "lucide-react";
import { useSkipSession } from "@/work/hooks/sessionControls";

export const SkipSession = ({ customText }: { customText?: string }) => {
  const handleSkip = useSkipSession();

  return (
    <Button
      size="lg"
      variant="outline"
      onClick={handleSkip}
      className="px-8 py-6 text-lg font-semibold hover:scale-105 transition-all"
    >
      <SkipForward className="mr-2 h-6 w-6" />
      {customText || "Skip"}
    </Button>
  );
};
