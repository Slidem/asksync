import { Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useGroupDialogStore } from "@/members/stores/groupDialogStore";

const DEFAULT_COLORS = [
  { value: "#3b82f6", name: "Blue" },
  { value: "#ef4444", name: "Red" },
  { value: "#10b981", name: "Green" },
  { value: "#f59e0b", name: "Amber" },
  { value: "#8b5cf6", name: "Violet" },
  { value: "#ec4899", name: "Pink" },
  { value: "#06b6d4", name: "Cyan" },
  { value: "#84cc16", name: "Lime" },
];

export function GroupColorPicker() {
  const color = useGroupDialogStore((state) => state.color);
  const setColor = useGroupDialogStore((state) => state.setColor);

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-sm font-medium">Group Color</Label>
        <p className="text-xs text-muted-foreground mt-1">
          Choose a color to visually identify this group
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        {DEFAULT_COLORS.map((colorOption) => (
          <button
            key={colorOption.value}
            type="button"
            onClick={() => setColor(colorOption.value)}
            className={`relative w-10 h-10 rounded-full border-2 transition-all ${
              color === colorOption.value
                ? "border-foreground scale-110 ring-2 ring-offset-2 ring-foreground/20"
                : "border-muted hover:scale-105 hover:border-foreground/50"
            }`}
            style={{ backgroundColor: colorOption.value }}
            aria-label={`Select ${colorOption.name}`}
            title={colorOption.name}
          >
            {color === colorOption.value && (
              <Check className="h-5 w-5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
