import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, Info } from "lucide-react";

import { AvailableTimeblocksList } from "@/questions/components/AvailableTimeblocksList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAvailableTimeblocksForUserAndTags } from "@/questions/hooks/queries";
import { useCreateQuestionDialogStore } from "./createQuestionDialogStore";
import { useMemberships } from "@/members/queries/queries";
import { useTagsWithAvailableTimeblocksForUser } from "@/tags/hooks/queries";

export function SelectAvailabilityStep() {
  const {
    selectedUserIds,
    selectedTagIds,
    setSelectedTagIds,
    previousStep,
    nextStep,
  } = useCreateQuestionDialogStore();

  const memberships = useMemberships();

  // Use first selected user for timeblock display (timeblocks are just informational now)
  const firstUserId = selectedUserIds[0] || "";
  const { tags, isLoading: areTagsLoading } =
    useTagsWithAvailableTimeblocksForUser(firstUserId);
  const { timeblocks, isLoading: areAvailableTimeblocksLoading } =
    useAvailableTimeblocksForUserAndTags({
      userId: firstUserId,
      tagIds: selectedTagIds,
    });

  const selectedUsers = memberships?.filter((m) =>
    selectedUserIds.includes(m.id),
  );

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds(
      selectedTagIds.includes(tagId)
        ? selectedTagIds.filter((id) => id !== tagId)
        : [...selectedTagIds, tagId],
    );
  };

  return (
    <div className="space-y-6">
      {/* Selected users info */}
      {selectedUsers && selectedUsers.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Asking {selectedUsers.length}{" "}
            {selectedUsers.length === 1 ? "person" : "people"}
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg"
              >
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{user.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-2">Select tags</h3>
        <p className="text-sm text-muted-foreground">
          Choose tags for your question. Available timeblocks shown for
          reference.
        </p>
      </div>

      {/* Tag selector */}
      <div>
        <p className="text-sm font-medium mb-3 block">Select tags</p>
        {!areTagsLoading && tags.length === 0 ? (
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
                        Fastest answer in ~ {tag.answerTimeDisplay}
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

      {/* Available timeblocks list (informational only) */}
      {selectedTagIds.length > 0 && !areAvailableTimeblocksLoading && (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-900/50">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Your question will be answered in one of the following
                  timeblocks
                </div>
                <div className="text-xs text-blue-700 dark:text-blue-300">
                  {timeblocks && timeblocks.length > 0 ? (
                    <span>
                      {timeblocks.length} available{" "}
                      {timeblocks.length === 1 ? "slot" : "slots"} match your
                      selected tags
                    </span>
                  ) : (
                    <span>No timeblocks available for the selected tags</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {timeblocks && timeblocks.length > 0 && (
            <div className="max-h-[400px] overflow-y-auto">
              <AvailableTimeblocksList timeblocks={timeblocks} />
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={previousStep}>
          Back
        </Button>
        <Button onClick={nextStep} disabled={selectedTagIds.length === 0}>
          Next
        </Button>
      </div>
    </div>
  );
}
