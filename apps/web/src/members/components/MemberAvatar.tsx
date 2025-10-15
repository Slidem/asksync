import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { AvatarImage } from "@radix-ui/react-avatar";
import React from "react";
import { useOrganization } from "@clerk/nextjs";

interface Props {
  id: string;
}

export const MemberAvatar: React.FC<Props> = ({ id }) => {
  const { memberships } = useOrganization({
    memberships: {
      infinite: true,
    },
  });

  const member = memberships?.data?.find((m) => m.id === id);
  const { imageUrl, firstName, lastName } = member?.publicUserData || {};
  const fallBackInitials = `${firstName?.charAt(0) || ""} ${
    lastName?.charAt(0) || ""
  }`.trim();

  return (
    <Avatar className="h-8 w-8 border-2 border-background">
      <AvatarImage src={imageUrl} alt={fallBackInitials} />
      <AvatarFallback className="text-xs">{fallBackInitials}</AvatarFallback>
    </Avatar>
  );
};
