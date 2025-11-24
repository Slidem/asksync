import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, User } from "lucide-react";

import { AvailableTimeblocksList } from "@/questions/components/AvailableTimeblocksList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAvailableTimeblocksForUserAndTags } from "@/questions/hooks/queries";
import { useCreateQuestionDialogStore } from "./createQuestionDialogStore";
import { useMemberships } from "@/members/queries/queries";
import { useTagsWithAvailableTimeblocksForUser } from "@/tags/hooks/queries";

export function SelectAvailabilityStep() {
  const {
    selectedUserId,
    selectedTagIds,
    selectedTimeblock,
    setSelectedTagIds,
    setSelectedTimeblock,
    previousStep,
    nextStep,
  } = useCreateQuestionDialogStore();

  const memberships = useMemberships();
  const tags = useTagsWithAvailableTimeblocksForUser(selectedUserId || "");
  const timeblocks = useAvailableTimeblocksForUserAndTags({
    userId: selectedUserId || "",
    tagIds: selectedTagIds,
  });

  const selectedUser = memberships?.find((m) => m.id === selectedUserId);

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds(
      selectedTagIds.includes(tagId)
        ? selectedTagIds.filter((id) => id !== tagId)
        : [...selectedTagIds, tagId],
    );
    setSelectedTimeblock(null);
  };

  const handleSkip = () => {
    setSelectedTimeblock(null);
    nextStep();
  };

  return (
    <div className="space-y-6">
      {/* Selected user info */}
      {selectedUser && (
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              {selectedUser.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-medium">{selectedUser.name}</div>
            <div className="text-sm text-muted-foreground">
              {selectedUser.email}
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-2">
          Select timeblock (optional)
        </h3>
        <p className="text-sm text-muted-foreground">
          Choose tags to filter available timeblocks
        </p>
      </div>

      {/* Tag selector */}
      <div>
        <p className="text-sm font-medium mb-3 block">Select tags</p>
        {tags.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/20">
            <p className="text-sm">
              No tags with available timeblocks for this user
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {tags.map((tag) => {
              const isSelected = selectedTagIds.includes(tag.id);
              return (
                <div
                  key={tag.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleTagToggle(tag.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleTagToggle(tag.id);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                >
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                      isSelected
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-input"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: tag.color,
                          color: tag.color,
                        }}
                      >
                        {tag.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Fastest answer: ~{tag.answerTimeDisplay}
                      </span>
                    </div>
                    {tag.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {tag.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Available timeblocks list */}
      {selectedTagIds.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Available timeblocks</p>
            {timeblocks && timeblocks.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {timeblocks.length} available
              </Badge>
            )}
          </div>
          <div className="max-h-[500px] overflow-y-auto pr-2">
            <AvailableTimeblocksList
              timeblocks={timeblocks}
              selectedTimeblock={selectedTimeblock}
              onSelect={setSelectedTimeblock}
            />
          </div>
        </div>
      )}

      {selectedTagIds.length === 0 && (
        <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/20">
          <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Select tags to view available timeblocks</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={previousStep}>
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleSkip}>
            Skip
          </Button>
          <Button onClick={nextStep} disabled={!selectedTimeblock}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
