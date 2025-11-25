import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AcceptedAnswerBadge() {
  return (
    <Badge variant="secondary" className="text-xs">
      <CheckCircle2 className="h-3 w-3 mr-1" />
      Accepted
    </Badge>
  );
}
