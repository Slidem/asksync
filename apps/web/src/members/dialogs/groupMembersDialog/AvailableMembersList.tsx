import { Badge } from "@/components/ui/badge";
import { MemberListItem } from "./MemberListItem";
import { OrganizationMembershipResource } from "@/members/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserPlus } from "lucide-react";

interface AvailableMembersListProps {
  members: OrganizationMembershipResource[];
  onAdd: (userId: string) => void;
}

export function AvailableMembersList({
  members,
  onAdd,
}: AvailableMembersListProps): React.ReactNode {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-sm">Available to Add</h4>
          <Badge variant="outline" className="rounded-full">
            {members.length}
          </Badge>
        </div>
      </div>
      <ScrollArea className="flex-1 border rounded-lg bg-muted/20">
        {members.length > 0 ? (
          <div className="space-y-1 p-2">
            {members.map((m) => {
              const { userId, imageUrl, firstName, lastName, identifier } =
                m.publicUserData || {};
              const displayName =
                firstName && lastName
                  ? `${firstName} ${lastName}`
                  : identifier || "Unknown";

              return (
                <MemberListItem
                  key={m.id}
                  userId={userId || ""}
                  imageUrl={imageUrl || ""}
                  displayName={displayName}
                  identifier={identifier || ""}
                  actionType="add"
                  onAction={onAdd}
                />
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <UserPlus className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Everyone's in the group!</p>
            <p className="text-xs text-muted-foreground mt-1">
              All organization members are already part of this group
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
