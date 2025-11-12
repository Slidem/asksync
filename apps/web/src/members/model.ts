import z from "zod";

// Group form schema for frontend
export const groupFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
  description: z.string().max(200, "Description is too long").optional(),
  color: z.string().min(1, "Color is required"),
});

export type GroupFormData = z.infer<typeof groupFormSchema>;

// Frontend types (use string IDs instead of backend Id types)
export interface Group {
  _id: string;
  name: string;
  description?: string;
  color: string;
  orgId: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface GroupWithMemberCount extends Group {
  memberCount: number;
}

export interface GroupMember {
  _id: string;
  groupId: string;
  userId: string;
  orgId: string;
  addedBy: string;
  addedAt: number;
}
