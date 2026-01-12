import { Badge } from "@/components/ui/badge";
import { MemberAvatar } from "@/members/components/MemberAvatar";
import { Users } from "lucide-react";

interface Participant {
  id: string;
  isAssignee?: boolean;
  isCreator?: boolean;
}

interface ParticipantsDisplayProps {
  participants: Participant[];
}

export function ParticipantsDisplay({
  participants,
}: ParticipantsDisplayProps): React.ReactNode {
  if (!participants || participants.length === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Participants:</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {participants.map((participant) => (
          <div key={participant.id} className="flex items-center gap-1">
            <MemberAvatar id={participant.id} />
            {participant.isAssignee && (
              <Badge variant="secondary" className="text-xs">
                Assignee
              </Badge>
            )}
            {participant.isCreator && (
              <Badge variant="outline" className="text-xs">
                Creator
              </Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
