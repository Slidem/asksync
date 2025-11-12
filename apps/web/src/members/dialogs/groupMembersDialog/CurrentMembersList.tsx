import { MemberListItem } from "./MemberListItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { OrganizationMembershipResource } from "@/members/types";

interface CurrentMembersListProps {
  members: OrganizationMembershipResource[];
  canManage: boolean;
  onRemove: (userId: string) => void;
}

export function CurrentMembersList({
  members,
  canManage,
  onRemove,
}: CurrentMembersListProps) {
  return (
    <div>
      <h4 className="font-medium mb-2">Current Members ({members.length})</h4>
      <ScrollArea className="h-[200px] border rounded-md p-2">
        {members.length > 0 ? (
          <div className="space-y-2">
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
                <div key={m.id} className="p-2">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{identifier}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            No members in this group
          </p>
        )}
      </ScrollArea>
    </div>
  );
}
