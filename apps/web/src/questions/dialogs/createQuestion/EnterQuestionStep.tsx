import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Clock, MapPin, Tag } from "lucide-react";
import { SortOrder, TagSortBy } from "@asksync/shared";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { useCreateQuestionDialogStore } from "./createQuestionDialogStore";
import { useMemberships } from "@/members/queries/queries";
import { useTags } from "@/tags/hooks/queries";

interface EnterQuestionStepProps {
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function EnterQuestionStep({
  onSubmit,
  isSubmitting,
}: EnterQuestionStepProps) {
  const {
    selectedUserId,
    selectedTimeblock,
    selectedTagIds,
    questionTitle,
    questionContent,
    setQuestionTitle,
    setQuestionContent,
    previousStep,
    canSubmit,
  } = useCreateQuestionDialogStore();

  const memberships = useMemberships();
  const { tags } = useTags({
    sorting: { sortBy: TagSortBy.NAME, sortOrder: SortOrder.ASC },
  });

  const selectedUser = memberships?.find((m) => m.id === selectedUserId);
  const selectedTags = tags.filter((t) => selectedTagIds.includes(t.id));

  const formatDuration = (startTime: number, endTime: number) => {
    const minutes = Math.round((endTime - startTime) / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit()) {
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Ask your question</h3>
        <p className="text-sm text-muted-foreground">
          Enter the question details
        </p>
      </div>

      {/* Summary card */}
      <Card className="p-4 space-y-3 bg-muted/30">
        <div className="text-sm font-medium text-muted-foreground">Summary</div>

        {/* User */}
        {selectedUser && (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {selectedUser.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{selectedUser.name}</span>
          </div>
        )}

        {/* Timeblock */}
        {selectedTimeblock && (
          <div className="space-y-2 pl-1 border-l-2 border-primary/30 ml-1">
            <div className="flex items-center gap-2 text-sm pl-2">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span>
                {format(new Date(selectedTimeblock.startTime), "EEEE, MMM d")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm pl-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span>
                {format(new Date(selectedTimeblock.startTime), "h:mm a")} -{" "}
                {format(new Date(selectedTimeblock.endTime), "h:mm a")}
              </span>
              <span className="text-xs text-muted-foreground">
                (
                {formatDuration(
                  selectedTimeblock.startTime,
                  selectedTimeblock.endTime,
                )}
                )
              </span>
            </div>
            {selectedTimeblock.location && (
              <div className="flex items-center gap-2 text-sm pl-2">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {selectedTimeblock.location}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {selectedTags.length > 0 && (
          <div className="flex items-start gap-2 pl-1">
            <Tag className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
            <div className="flex flex-wrap gap-1.5">
              {selectedTags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="text-xs"
                  style={{
                    backgroundColor: `${tag.color}15`,
                    borderColor: tag.color,
                    color: tag.color,
                  }}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Question form */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">
            Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            placeholder="Enter question title..."
            value={questionTitle}
            onChange={(e) => setQuestionTitle(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            placeholder="Enter question details (optional)..."
            value={questionContent}
            onChange={(e) => setQuestionContent(e.target.value)}
            rows={6}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t">
        <Button type="button" variant="outline" onClick={previousStep}>
          Back
        </Button>
        <Button type="submit" disabled={!canSubmit() || isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Question"}
        </Button>
      </div>
    </form>
  );
}
