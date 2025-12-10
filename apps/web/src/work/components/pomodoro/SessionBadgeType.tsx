import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getSessionLabel } from "@/work/utils/formatting";
import { memo } from "react";

/**
 * Session type badge component
 */
export const SessionTypeBadge = memo(function SessionTypeBadge({
  sessionType,
}: {
  sessionType: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-lg font-medium px-4 py-2",
        sessionType === "work" && "border-blue-500 text-blue-600",
        sessionType === "shortBreak" && "border-green-500 text-green-600",
        sessionType === "longBreak" && "border-orange-500 text-orange-600",
      )}
    >
      {getSessionLabel(sessionType)}
    </Badge>
  );
});
