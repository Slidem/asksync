import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SortOrder, TagSortBy } from "@asksync/shared";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TiptapEditor } from "@/components/editor/TiptapEditor";
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
}: EnterQuestionStepProps): React.ReactNode {
  const {
    selectedUserIds,
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

  const selectedUsers = memberships?.filter((m) =>
    selectedUserIds.includes(m.id),
  );
  const selectedTags = tags.filter((t) => selectedTagIds.includes(t.id));

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
      </div>

      {/* Summary - stylish and informative */}
      <div className="bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl p-6 space-y-5">
        {/* Users Section */}
        {selectedUsers && selectedUsers.length > 0 && (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">You are asking</div>
            <div className="grid gap-2">
              {selectedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-2.5 bg-background/60 rounded-lg shadow-sm"
                >
                  <Avatar className="h-9 w-9 ring-2 ring-primary/10">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                      {user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {user.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags Section */}
        {selectedTags.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-border/30">
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="text-xs font-medium shadow-sm px-3 py-1"
                  style={{
                    backgroundColor: `${tag.color}25`,
                    color: tag.color,
                  }}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

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
          <TiptapEditor
            value={questionContent}
            onChange={(html, plaintext) => setQuestionContent(html, plaintext)}
            placeholder="Enter question details (optional)..."
            minHeight={120}
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
