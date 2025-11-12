// Shared types for members module

export type OrganizationMembershipResource = {
  id: string;
  role: string;
  publicUserData?: {
    userId?: string;
    firstName?: string | null;
    lastName?: string | null;
    identifier?: string;
    imageUrl?: string;
  };
};
