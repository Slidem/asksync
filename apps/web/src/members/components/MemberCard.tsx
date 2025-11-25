import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Shield, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
  const isAdmin = role === "org:admin";

  return (
    <Card className="group hover:shadow-md transition-all border-primary/20 hover:border-primary/50">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 ring-2 ring-muted">
            <AvatarImage src={imageUrl} alt={displayName} />
            <AvatarFallback className="text-base">{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-base truncate">
                {displayName}
              </h3>
              {isCurrentUser && (
                <Badge variant="outline" className="text-xs">
                  You
                </Badge>
              )}
              {isAdmin && (
                <Badge variant="secondary" className="gap-1">
                  <Shield className="h-3 w-3" />
                  Admin
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
              <Mail className="h-3.5 w-3.5" />
              <p className="truncate">{identifier}</p>
            </div>

            {!isAdmin && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>Member</span>
              </div>
            )}
          </div>

          {canManage && !isCurrentUser && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Action buttons will be added in future phases */}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
