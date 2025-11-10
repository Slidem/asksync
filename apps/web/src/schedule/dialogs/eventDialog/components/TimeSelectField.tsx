"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";
import React from "react";
import { calendarTimeOptions } from "@/schedule/utils";
import { cn } from "@/lib/utils";

interface TimeSelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export const TimeSelectField = React.memo<TimeSelectFieldProps>(
  ({ id, label, value, onChange, disabled = false, className }) => {
    return (
      <div className={cn("min-w-28 *:not-first:mt-1.5", className)}>
        <Label htmlFor={id}>{label}</Label>
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger id={id}>
            <SelectValue placeholder="Select time" />
          </SelectTrigger>
          <SelectContent>
            {calendarTimeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  },
);

TimeSelectField.displayName = "TimeSelectField";
