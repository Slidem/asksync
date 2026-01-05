"use client";

import React, { useState } from "react";

import { DatePickerField } from "./DatePickerField";
import { TimeSelectField } from "./TimeSelectField";
import { useEventDialogStore } from "@/schedule/dialogs/eventDialog/eventDialogStore";
import { useShallow } from "zustand/react/shallow";

export const EventDateTimeFields = React.memo(() => {
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const { startDate, endDate, startTime, endTime, allDay, source } =
    useEventDialogStore(
      useShallow((state) => ({
        startDate: state.formFields.startDate,
        endDate: state.formFields.endDate,
        startTime: state.formFields.startTime,
        endTime: state.formFields.endTime,
        allDay: state.formFields.allDay,
        source: state.eventMetadata.source,
      })),
    );

  const isExternalEvent = source !== "asksync";

  const updateFields = useEventDialogStore((state) => state.setFormFields);

  return (
    <>
      {/* Start Date/Time Row */}
      <div className="flex gap-4">
        <DatePickerField
          id="start-date"
          label="Start Date"
          value={startDate}
          onChange={(date) => updateFields({ startDate: date })}
          isOpen={startDateOpen}
          onOpenChange={setStartDateOpen}
          disabled={isExternalEvent}
          className="flex-1"
        />

        {!allDay && (
          <TimeSelectField
            id="start-time"
            label="Start Time"
            value={startTime}
            onChange={(value) => updateFields({ startTime: value })}
            disabled={isExternalEvent}
          />
        )}
      </div>

      <div className="flex gap-4">
        <DatePickerField
          id="end-date"
          label="End Date"
          value={endDate}
          onChange={(date) => updateFields({ endDate: date })}
          isOpen={endDateOpen}
          onOpenChange={setEndDateOpen}
          disabled={isExternalEvent}
          disableBefore={startDate}
          className="flex-1"
        />

        {!allDay && (
          <TimeSelectField
            id="end-time"
            label="End Time"
            value={endTime}
            onChange={(value) => updateFields({ endTime: value })}
            disabled={isExternalEvent}
          />
        )}
      </div>
    </>
  );
});

EventDateTimeFields.displayName = "EventDateTimeFields";
