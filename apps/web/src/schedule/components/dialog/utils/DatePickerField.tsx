"use client";

import React from "react";
import { format } from "date-fns";
import { RiCalendarLine } from "@remixicon/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface DatePickerFieldProps {
  id: string;
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  disabled?: boolean;
  disableBefore?: Date;
  className?: string;
}

export const DatePickerField = React.memo<DatePickerFieldProps>(({
  id,
  label,
  value,
  onChange,
  isOpen,
  onOpenChange,
  disabled = false,
  disableBefore,
  className,
}) => {
  const handleDateSelect = React.useCallback((date: Date | undefined) => {
    if (date) {
      onChange(date);
      onOpenChange(false);
    }
  }, [onChange, onOpenChange]);

  return (
    <div className={cn("*:not-first:mt-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      <Popover open={isOpen} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            disabled={disabled}
            className={cn(
              "group bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]",
              !value && "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "truncate",
                !value && "text-muted-foreground",
              )}
            >
              {value ? format(value, "PPP") : "Pick a date"}
            </span>
            <RiCalendarLine
              size={16}
              className="text-muted-foreground/80 shrink-0"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <Calendar
            mode="single"
            selected={value}
            defaultMonth={value}
            onSelect={handleDateSelect}
            disabled={disableBefore ? { before: disableBefore } : undefined}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
});

DatePickerField.displayName = "DatePickerField";