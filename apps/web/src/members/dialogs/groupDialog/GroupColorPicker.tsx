import { Label } from "@/components/ui/label";
import { useGroupDialogStore } from "@/members/stores/groupDialogStore";

const DEFAULT_COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // green
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
];

export function GroupColorPicker() {
  const color = useGroupDialogStore((state) => state.color);
  const setColor = useGroupDialogStore((state) => state.setColor);

  return (
    <div className="space-y-2">
      <Label>Color</Label>
      <div className="flex gap-2">
        {DEFAULT_COLORS.map((colorOption) => (
          <button
            key={colorOption}
            type="button"
            onClick={() => setColor(colorOption)}
            className={`w-8 h-8 rounded-full border-2 transition-all ${
              color === colorOption
                ? "border-foreground scale-110"
                : "border-transparent hover:scale-105"
            }`}
            style={{ backgroundColor: colorOption }}
            aria-label={`Select ${colorOption}`}
          />
        ))}
      </div>
    </div>
  );
}
