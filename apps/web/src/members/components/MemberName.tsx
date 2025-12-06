import React from "react";
import { useOrganization } from "@clerk/nextjs";

interface Props {
  id: string;
  className?: string;
}

export const MemberName: React.FC<Props> = ({ id, className }) => {
  const { memberships } = useOrganization({
    memberships: {
      infinite: true,
    },
  });

  const member = memberships?.data?.find(
    (m) => m.publicUserData?.userId === id,
  );
  const { firstName, lastName, identifier } = member?.publicUserData || {};
  const displayName =
    firstName && lastName
      ? `${firstName} ${lastName}`
      : identifier || "Unknown";

  return <span className={className}>{displayName}</span>;
};
