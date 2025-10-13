"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import React from "react";
import { RecurrenceRule } from "@asksync/shared";
import { useEventDialogStore } from "@/schedule/stores/eventDialogStore";
import { useShallow } from "zustand/react/shallow";

export const EventRecurrenceFields = React.memo(() => {
  const {
    isRecurring,
    recurrenceRule,
    isExternalEvent,
    canOnlyEditTags,
    setIsRecurring,
    setRecurrenceRule,
  } = useEventDialogStore(
    useShallow((state) => ({
      isRecurring: state.isRecurring,
      recurrenceRule: state.recurrenceRule,
      isExternalEvent: state.isExternalEvent,
      canOnlyEditTags: state.canOnlyEditTags,
      setIsRecurring: state.setIsRecurring,
      setRecurrenceRule: state.setRecurrenceRule,
    })),
  );

  const handleRecurringChange = React.useCallback(
    (checked: boolean | "indeterminate") => {
      setIsRecurring(checked === true);
    },
    [setIsRecurring],
  );

  const handleRecurrenceRuleChange = React.useCallback(
    (value: RecurrenceRule) => {
      setRecurrenceRule(value);
    },
    [setRecurrenceRule],
  );

  // Only show recurrence for AskSync events
  if (isExternalEvent) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Checkbox
          id="recurring"
          checked={isRecurring}
          onCheckedChange={handleRecurringChange}
          disabled={canOnlyEditTags}
        />
        <Label htmlFor="recurring">Recurring event</Label>
      </div>

      {isRecurring && (
        <Select
          value={recurrenceRule}
          onValueChange={handleRecurrenceRuleChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select recurrence pattern" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={RecurrenceRule.DAILY}>Daily</SelectItem>
            <SelectItem value={RecurrenceRule.WEEKLY}>Weekly</SelectItem>
            <SelectItem value={RecurrenceRule.WEEKDAYS}>Weekdays</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
});

EventRecurrenceFields.displayName = "EventRecurrenceFields";
