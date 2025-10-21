import { Doc } from "../_generated/dataModel";
import { PatchValue } from "../common/types";

export function addOptionalValue<K extends keyof Doc<"timeblocks">>(
  obj: PatchValue<Doc<"timeblocks">>,
  key: K,
  value: Doc<"timeblocks">[K] | undefined,
) {
  if (value !== undefined) {
    obj[key] = value;
  }
}

export function validateTimeRange(startTime: number, endTime: number) {
  if (endTime <= startTime) {
    throw new Error("End time must be after start time");
  }
}

export function validateRecurringTimeblock(
  timeblock: Doc<"timeblocks">,
): asserts timeblock is Doc<"timeblocks"> & { isRecurring: true } {
  if (!timeblock.isRecurring) {
    throw new Error("Operation only valid for recurring timeblocks");
  }
}
