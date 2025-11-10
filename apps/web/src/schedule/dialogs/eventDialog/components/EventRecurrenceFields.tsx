"use client";

import React, { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RecurrenceRule } from "@asksync/shared";
import { useEventDialogStore } from "@/schedule/dialogs/eventDialog/eventDialogStore";
import { useShallow } from "zustand/react/shallow";

export const EventRecurrenceFields = React.memo(() => {
  const { recurrenceRule, isExternalEvent, canOnlyEditTags } =
    useEventDialogStore(
      useShallow((state) => ({
        recurrenceRule: state.formFields.recurrenceRule,
        isExternalEvent: state.isExternalEvent,
        canOnlyEditTags: state.canOnlyEditTags,
      })),
    );

  const updateFields = useEventDialogStore((state) => state.setFormFields);

  const [isRecurring, setIsRecurring] = React.useState(!!recurrenceRule);

  useEffect(() => {
    return () => {
      setIsRecurring(false);
    };
  }, [setIsRecurring]);

  const handleRecurringChange = React.useCallback(
    (checked: boolean | "indeterminate") => {
      const isRecurring = checked === true;
      setIsRecurring(isRecurring);
      updateFields({
        recurrenceRule: isRecurring ? RecurrenceRule.WEEKLY : null,
      });
    },
    [updateFields],
  );

  const handleRecurrenceRuleChange = React.useCallback(
    (value: RecurrenceRule) => {
      updateFields({ recurrenceRule: value });
    },
    [updateFields],
  );

  if (isExternalEvent) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Checkbox
          id="recurring"
          checked={isRecurring || !!recurrenceRule}
          onCheckedChange={handleRecurringChange}
          disabled={canOnlyEditTags}
        />
        <Label htmlFor="recurring">Recurring event</Label>
      </div>

      {isRecurring && (
        <Select
          value={recurrenceRule || RecurrenceRule.WEEKLY}
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
