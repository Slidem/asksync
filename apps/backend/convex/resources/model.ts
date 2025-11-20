import { Id } from "../_generated/dataModel";

export type ResourceType = "tags" | "timeblocks" | "questions";

export type ResourceIdType = Id<"timeblocks" | "tags" | "questions">;
