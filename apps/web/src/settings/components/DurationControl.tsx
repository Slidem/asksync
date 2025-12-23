import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus } from "lucide-react";

interface DurationControlProps {
  label: string;
  value: number; // in minutes
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  description?: string;
}

export function DurationControl({
  label,
  value,
  onChange,
  min = 1,
  max = 180,
  description,
}: DurationControlProps) {
  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="space-y-2">
      <div>
        <Label htmlFor={`duration-${label}`}>{label}</Label>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={value <= min}
          className="h-9 w-9"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <div className="flex-1 relative">
          <Input
            id={`duration-${label}`}
            type="number"
            value={value}
            onChange={handleInputChange}
            min={min}
            max={max}
            className="text-center font-medium"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
            {formatDuration(value)}
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          disabled={value >= max}
          className="h-9 w-9"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
