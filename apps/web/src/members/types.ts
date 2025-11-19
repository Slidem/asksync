import z from "zod";

export const groupFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
  description: z.string().max(200, "Description is too long").optional(),
  color: z.string().min(1, "Color is required"),
});

export type GroupFormData = z.infer<typeof groupFormSchema>;

export interface Group {
  id: string;
  name: string;
  description?: string;
  color: string;
  orgId: string;
}

export interface GroupWithMemberCount extends Group {
  memberCount: number;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  orgId: string;
  addedBy: string;
  addedAt: number;
}

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

export type Membership = {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
};
