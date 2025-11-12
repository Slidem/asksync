import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ResourceType = "tags" | "timeblocks";

interface ResourceTypeSelectorProps {
  value: ResourceType;
  onChange: (value: ResourceType) => void;
}

export function ResourceTypeSelector({
  value,
  onChange,
}: ResourceTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Resource Type</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="tags">Tags</SelectItem>
          <SelectItem value="timeblocks">Timeblocks</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
