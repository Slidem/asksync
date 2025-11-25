import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ArrowUpDown } from "lucide-react";
import { QuestionFilters } from "@asksync/shared";

interface QuestionsSortDropdownProps {
  value: QuestionFilters["sortBy"];
  onChange: (value: QuestionFilters["sortBy"]) => void;
}

export function QuestionsSortDropdown({
  value,
  onChange,
}: QuestionsSortDropdownProps) {
  return (
    <Select
      value={value || "expectedTime"}
      onValueChange={(val) => onChange(val as QuestionFilters["sortBy"])}
    >
      <SelectTrigger className="w-[160px]">
        <ArrowUpDown className="h-4 w-4 mr-2" />
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="expectedTime">Answer Time</SelectItem>
        <SelectItem value="createdAt">Created Date</SelectItem>
        <SelectItem value="updatedAt">Last Updated</SelectItem>
      </SelectContent>
    </Select>
  );
}
