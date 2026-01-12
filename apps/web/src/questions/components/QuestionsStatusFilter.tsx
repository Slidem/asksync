import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Filter } from "lucide-react";
import { QuestionFilters } from "@asksync/shared";

interface QuestionsStatusFilterProps {
  value: QuestionFilters["status"];
  onChange: (value: QuestionFilters["status"]) => void;
}

export function QuestionsStatusFilter({
  value,
  onChange,
}: QuestionsStatusFilterProps): React.ReactNode {
  return (
    <Select
      value={value || "all"}
      onValueChange={(val) => onChange(val as QuestionFilters["status"])}
    >
      <SelectTrigger className="w-[160px]">
        <Filter className="h-4 w-4 mr-2" />
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Status</SelectItem>
        <SelectItem value="unanswered">Unanswered</SelectItem>
        <SelectItem value="ongoing">Ongoing</SelectItem>
        <SelectItem value="answered">Answered</SelectItem>
      </SelectContent>
    </Select>
  );
}
