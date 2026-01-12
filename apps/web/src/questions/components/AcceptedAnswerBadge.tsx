import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

export function AcceptedAnswerBadge(): React.ReactNode {
  return (
    <Badge variant="secondary" className="text-xs">
      <CheckCircle2 className="h-3 w-3 mr-1" />
      Accepted
    </Badge>
  );
}
