import { MemberListItem } from "./MemberListItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { OrganizationMembershipResource } from "@/members/types";

interface AvailableMembersListProps {
  members: OrganizationMembershipResource[];
  onAdd: (userId: string) => void;
}

export function AvailableMembersList({
  members,
  onAdd,
}: AvailableMembersListProps) {
  return (
    <div>
      <h4 className="font-medium mb-2">Add Members ({members.length})</h4>
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
          <p className="text-sm text-muted-foreground text-center py-8">
            All members are in this group
          </p>
        )}
      </ScrollArea>
    </div>
  );
}
