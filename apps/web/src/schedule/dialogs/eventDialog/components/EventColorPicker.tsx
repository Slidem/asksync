"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import type { EventColor } from "@/schedule/types";
import React from "react";
import { cn } from "@/lib/utils";
import { useEventDialogStore } from "@/schedule/dialogs/eventDialog/eventDialogStore";
import { useShallow } from "zustand/react/shallow";

const colorOptions: Array<{
  value: EventColor;
  label: string;
  bgClass: string;
  borderClass: string;
}> = [
  {
    value: "sky",
    label: "Sky",
    bgClass: "bg-sky-400 data-[state=checked]:bg-sky-400",
    borderClass: "border-sky-400 data-[state=checked]:border-sky-400",
  },
  {
    value: "amber",
    label: "Amber",
    bgClass: "bg-amber-400 data-[state=checked]:bg-amber-400",
    borderClass: "border-amber-400 data-[state=checked]:border-amber-400",
  },
  {
    value: "violet",
    label: "Violet",
    bgClass: "bg-violet-400 data-[state=checked]:bg-violet-400",
    borderClass: "border-violet-400 data-[state=checked]:border-violet-400",
  },
  {
    value: "rose",
    label: "Rose",
    bgClass: "bg-rose-400 data-[state=checked]:bg-rose-400",
    borderClass: "border-rose-400 data-[state=checked]:border-rose-400",
  },
  {
    value: "emerald",
    label: "Emerald",
    bgClass: "bg-emerald-400 data-[state=checked]:bg-emerald-400",
    borderClass: "border-emerald-400 data-[state=checked]:border-emerald-400",
  },
  {
    value: "orange",
    label: "Orange",
    bgClass: "bg-orange-400 data-[state=checked]:bg-orange-400",
    borderClass: "border-orange-400 data-[state=checked]:border-orange-400",
  },
];

export const EventColorPicker = React.memo(() => {
  const { color, canOnlyEditTags } = useEventDialogStore(
    useShallow((state) => ({
      color: state.formFields.color,
      canOnlyEditTags: state.canOnlyEditTags,
    })),
  );

  const updateFields = useEventDialogStore((state) => state.setFormFields);

  const handleColorChange = React.useCallback(
    (value: EventColor) => {
      updateFields({ color: value });
    },
    [updateFields],
  );

  return (
    <fieldset className="space-y-4">
      <legend className="text-foreground text-sm leading-none font-medium">
        Etiquette
      </legend>
      <RadioGroup
        className="flex gap-1.5"
        defaultValue={colorOptions[0]?.value}
        value={color}
        onValueChange={handleColorChange}
        disabled={canOnlyEditTags}
      >
        {colorOptions.map((colorOption) => (
          <RadioGroupItem
            key={colorOption.value}
            id={`color-${colorOption.value}`}
            value={colorOption.value}
            aria-label={colorOption.label}
            className={cn(
              "size-6 shadow-none",
              colorOption.bgClass,
              colorOption.borderClass,
            )}
          />
        ))}
      </RadioGroup>
    </fieldset>
  );
});

EventColorPicker.displayName = "EventColorPicker";
