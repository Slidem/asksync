import { AlertTriangle, Check, Info } from "lucide-react";

import { AvailableTimeblocksList } from "./AvailableTimeblocksList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectedMembersDisplay } from "./SelectedMembersDisplay";
import { Tag } from "@asksync/shared";
import { TiptapEditor } from "@/components/editor/TiptapEditor";
import { UserSelector } from "./UserSelector";
import { api } from "@convex/api";
import { toast } from "sonner";
import { useAvailableTimeblocksForUserAndTags } from "@/questions/hooks/queries";
import { useMemberships } from "@/members/queries/queries";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";

interface AskQuestionFromTagProps {
  tag: Tag;
}

export function AskQuestionFromTag({ tag }: AskQuestionFromTagProps) {
  const router = useRouter();
  const { user } = useUser();
  const memberships = useMemberships();
  const createQuestion = useMutation(api.questions.mutations.createQuestion);

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [questionTitle, setQuestionTitle] = useState("");
  const [questionContent, setQuestionContent] = useState("");
  const [questionContentPlaintext, setQuestionContentPlaintext] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdQuestionId, setCreatedQuestionId] = useState<string | null>(
    null,
  );

  // Get available timeblocks for the first selected user (informational)
  const firstUserId = selectedUserIds[0] || "";
  const { timeblocks, isLoading: areTimeblocksLoading } =
    useAvailableTimeblocksForUserAndTags({
      userId: firstUserId,
      tagIds: [tag.id],
    });

  const handleUserToggle = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const handleChangeSelection = () => {
    setSelectedUserIds([]);
  };

  // Filter out current user
  const availableUsers =
    memberships
      ?.filter((member) => member.id !== user?.id)
      .map((member) => ({
        id: member.id,
        name: member.name,
        email: member.email,
        imageUrl: member.imageUrl,
      })) || [];

  const selectedUsers = availableUsers.filter((u) =>
    selectedUserIds.includes(u.id),
  );

  const handleSubmit = async () => {
    if (selectedUserIds.length === 0) {
      toast.error("Please select at least one user");
      return;
    }

    if (!questionTitle.trim()) {
      toast.error("Question title is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const questionId = await createQuestion({
        title: questionTitle,
        content: questionContent,
        contentPlaintext: questionContentPlaintext,
        tagIds: [tag.id],
        assigneeIds: selectedUserIds,
        participants: [],
      });

      setCreatedQuestionId(questionId);
      toast.success("Question created successfully!");
      // Don't call onSuccess here - let user see success state and choose to view question or close dialog
    } catch (error) {
      console.error("Error creating question:", error);
      toast.error("Failed to create question. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show success state after question is created
  if (createdQuestionId) {
    return (
      <div className="space-y-6 py-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-1">Question Created!</h3>
            <p className="text-sm text-muted-foreground">
              Your question has been sent to the selected team members
            </p>
          </div>
          <Button
            onClick={() => router.push(`/questions/${createdQuestionId}`)}
          >
            View Question
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tag info (read-only) */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Tag</Label>
        <Badge
          variant="outline"
          className="text-sm px-3 py-2"
          style={{
            borderColor: tag.color,
            color: tag.color,
          }}
        >
          {tag.name}
        </Badge>
        {tag.description && (
          <p className="text-xs text-muted-foreground mt-2">
            {tag.description}
          </p>
        )}
      </div>

      {/* User selector */}
      <div>
        <Label className="text-sm font-medium mb-3 block">
          Who do you want to ask?
        </Label>
        {selectedUsers.length > 0 ? (
          <SelectedMembersDisplay
            users={selectedUsers}
            onChangeSelection={handleChangeSelection}
          />
        ) : (
          <UserSelector
            selectedUserIds={selectedUserIds}
            onUserToggle={handleUserToggle}
            availableUsers={availableUsers}
            placeholder="Search for team members..."
          />
        )}
      </div>

      {/* Expected answer time info */}
      {selectedUserIds.length > 0 && !areTimeblocksLoading && (
        <div className="space-y-4">
          {tag.answerMode === "on-demand" ? (
            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 border border-amber-200/50 dark:border-amber-900/50">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    On-demand tag: User will receive notification immediately
                    and answer within {tag.responseTimeMinutes} minutes
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-900/50">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Question will be answered in one of the following timeblocks
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    {timeblocks && timeblocks.length > 0 ? (
                      <span>
                        {timeblocks.length} available{" "}
                        {timeblocks.length === 1 ? "slot" : "slots"}
                      </span>
                    ) : (
                      <span>No timeblocks available for this tag</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {timeblocks &&
            timeblocks.length > 0 &&
            tag.answerMode === "scheduled" && (
              <div className="max-h-[300px] overflow-y-auto">
                <AvailableTimeblocksList timeblocks={timeblocks} />
              </div>
            )}
        </div>
      )}

      {/* Question form */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="title" className="text-sm font-medium mb-2 block">
            Question Title *
          </Label>
          <Input
            id="title"
            placeholder="What do you want to ask?"
            value={questionTitle}
            onChange={(e) => setQuestionTitle(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label htmlFor="content" className="text-sm font-medium mb-2 block">
            Details (optional)
          </Label>
          <TiptapEditor
            value={questionContent}
            onChange={(html, plaintext) => {
              setQuestionContent(html);
              setQuestionContentPlaintext(plaintext);
            }}
            placeholder="Add more context to your question..."
            minHeight={100}
          />
        </div>
      </div>

      {/* Submit button */}
      <div className="flex justify-end pt-4 border-t">
        <Button
          onClick={handleSubmit}
          disabled={
            isSubmitting ||
            selectedUserIds.length === 0 ||
            !questionTitle.trim()
          }
        >
          {isSubmitting ? "Creating..." : "Create Question"}
        </Button>
      </div>
    </div>
  );
}
