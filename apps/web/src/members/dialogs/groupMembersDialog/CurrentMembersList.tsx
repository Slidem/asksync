import { Badge } from "@/components/ui/badge";
import { MemberListItem } from "./MemberListItem";
import { OrganizationMembershipResource } from "@/members/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserCheck } from "lucide-react";

interface CurrentMembersListProps {
  members: OrganizationMembershipResource[];
  canManage: boolean;
  onRemove: (userId: string) => void;
}

export function CurrentMembersList({
  members,
  canManage,
  onRemove,
}: CurrentMembersListProps): React.ReactNode {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-sm">Current Members</h4>
          <Badge variant="secondary" className="rounded-full">
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

              return canManage ? (
                <MemberListItem
                  key={m.id}
                  userId={userId || ""}
                  imageUrl={imageUrl || ""}
                  displayName={displayName}
                  identifier={identifier || ""}
                  actionType="remove"
                  onAction={onRemove}
                />
              ) : (
                <div key={m.id} className="p-3 rounded-md hover:bg-muted/50">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{identifier}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <UserCheck className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No members yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              {canManage
                ? "Add members below to get started"
                : "This group is empty"}
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
