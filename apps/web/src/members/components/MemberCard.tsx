import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { RoleBadge } from "./RoleBadge";
import { OrganizationMembershipResource } from "@/members/types";

interface MemberCardProps {
  membership: OrganizationMembershipResource;
  currentUserId: string;
  canManage: boolean; // Whether current user can manage members (is admin)
}

export function MemberCard({
  membership,
  currentUserId,
  canManage,
}: MemberCardProps) {
  const { publicUserData, role } = membership;
  const imageUrl = publicUserData?.imageUrl || "";
  const firstName = publicUserData?.firstName || "";
  const lastName = publicUserData?.lastName || "";
  const identifier = publicUserData?.identifier || "";

  const displayName =
    firstName && lastName ? `${firstName} ${lastName}` : identifier;

  const initials =
    firstName && lastName
      ? `${firstName.charAt(0)}${lastName.charAt(0)}`
      : identifier?.charAt(0).toUpperCase() || "?";

  const isCurrentUser = publicUserData?.userId === currentUserId;
  const memberRole = role === "org:admin" ? "admin" : "member";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={imageUrl} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate">
                {displayName}
                {isCurrentUser && (
                  <span className="text-muted-foreground text-sm ml-2">
                    (You)
                  </span>
                )}
              </h3>
              <RoleBadge role={memberRole} />
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {identifier}
            </p>
          </div>

          {canManage && !isCurrentUser && (
            <div className="flex gap-2">
              {/* Action buttons will be added in Phase 4 */}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
