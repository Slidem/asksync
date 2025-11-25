import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { AvatarImage } from "@radix-ui/react-avatar";
import React from "react";
import { useOrganization } from "@clerk/nextjs";

interface Props {
  id: string;
  showTooltip?: boolean;
}

export const MemberAvatar: React.FC<Props> = ({ id, showTooltip = true }) => {
  const { memberships } = useOrganization({
    memberships: {
      infinite: true,
    },
  });

  const member = memberships?.data?.find(
    (m) => m.publicUserData?.userId === id,
  );
  const { imageUrl, firstName, lastName, identifier } =
    member?.publicUserData || {};
  const fallBackInitials = `${firstName?.charAt(0) || ""} ${
    lastName?.charAt(0) || ""
  }`.trim();
  const displayName =
    firstName && lastName
      ? `${firstName} ${lastName}`
      : identifier || "Unknown User";

  const avatar = (
    <Avatar className="h-8 w-8 border-2 border-background">
      <AvatarImage src={imageUrl} alt={fallBackInitials} />
      <AvatarFallback className="text-xs">{fallBackInitials}</AvatarFallback>
    </Avatar>
  );

  if (!showTooltip) return avatar;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{avatar}</TooltipTrigger>
        <TooltipContent>
          <p>{displayName}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
