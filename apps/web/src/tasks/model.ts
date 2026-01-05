import { Task as SharedTask } from "@asksync/shared";

/**
 * Extended Task type for the web frontend.
 * Includes backend-specific fields from the Convex tasks table.
 */
export interface Task extends SharedTask {
  orgId: string;
  createdBy: string;
  createdAt: number;
}
