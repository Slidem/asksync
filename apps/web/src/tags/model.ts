import { PermissionGrant } from "@asksync/shared";
import z from "zod";

export const tagFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
  description: z.string().max(200, "Description is too long").optional(),
  color: z.string().min(1, "Color is required"),
  answerMode: z.enum(["on-demand", "scheduled"]),
  responseTimeMinutes: z.number().optional(),
  isPublic: z.boolean(),
  permissions: z.array(z.any()).optional(), // PermissionGrant[] - not validated here
});

export type TagFormData = z.infer<typeof tagFormSchema> & {
  permissions?: PermissionGrant[];
};
