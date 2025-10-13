"use client";

import { DatePickerField } from "../utils/DatePickerField";
import React from "react";
import { TimeSelectField } from "../utils/TimeSelectField";
import { useEventDialogStore } from "@/schedule/stores/eventDialogStore";
import { useShallow } from "zustand/react/shallow";

export const EventDateTimeFields = React.memo(() => {
  const {
    startDate,
    endDate,
    startTime,
    endTime,
    allDay,
    startDateOpen,
    endDateOpen,
    timeOptions,
    canOnlyEditTags,
    setStartDate,
    setEndDate,
    setStartTime,
    setEndTime,
    setStartDateOpen,
    setEndDateOpen,
  } = useEventDialogStore(
    useShallow((state) => ({
      startDate: state.startDate,
      endDate: state.endDate,
      startTime: state.startTime,
      endTime: state.endTime,
      allDay: state.allDay,
      startDateOpen: state.startDateOpen,
      endDateOpen: state.endDateOpen,
      timeOptions: state.timeOptions,
      canOnlyEditTags: state.canOnlyEditTags,
      setStartDate: state.setStartDate,
      setEndDate: state.setEndDate,
      setStartTime: state.setStartTime,
      setEndTime: state.setEndTime,
      setStartDateOpen: state.setStartDateOpen,
      setEndDateOpen: state.setEndDateOpen,
    })),
  );

  return (
    <>
      {/* Start Date/Time Row */}
      <div className="flex gap-4">
        <DatePickerField
          id="start-date"
          label="Start Date"
          value={startDate}
          onChange={setStartDate}
          isOpen={startDateOpen}
          onOpenChange={setStartDateOpen}
          disabled={canOnlyEditTags}
          className="flex-1"
        />

        {!allDay && (
          <TimeSelectField
            id="start-time"
            label="Start Time"
            value={startTime}
            onChange={setStartTime}
            timeOptions={timeOptions}
            disabled={canOnlyEditTags}
          />
        )}
      </div>

      {/* End Date/Time Row */}
      <div className="flex gap-4">
        <DatePickerField
          id="end-date"
          label="End Date"
          value={endDate}
          onChange={setEndDate}
          isOpen={endDateOpen}
          onOpenChange={setEndDateOpen}
          disabled={canOnlyEditTags}
          disableBefore={startDate}
          className="flex-1"
        />

        {!allDay && (
          <TimeSelectField
            id="end-time"
            label="End Time"
            value={endTime}
            onChange={setEndTime}
            timeOptions={timeOptions}
            disabled={canOnlyEditTags}
          />
        )}
      </div>
    </>
  );
});

EventDateTimeFields.displayName = "EventDateTimeFields";
