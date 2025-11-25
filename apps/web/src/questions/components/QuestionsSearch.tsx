import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface QuestionsSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function QuestionsSearch({ value, onChange }: QuestionsSearchProps) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search questions..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}
