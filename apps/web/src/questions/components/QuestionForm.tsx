import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateQuestionForm, Tag } from "@asksync/shared";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TagSelector } from "./TagSelector";
import { TiptapEditor } from "@/components/editor/TiptapEditor";
import { UserSelector } from "./UserSelector";
import { useCallback } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
}

interface QuestionFormProps {
  formData: CreateQuestionForm;
  onFormDataChange: React.Dispatch<React.SetStateAction<CreateQuestionForm>>;
  availableTags: Tag[];
  availableUsers: User[];
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  expectedAnswerTime?: Date | null;
  currentUserId?: string;
}

export function QuestionForm({
  formData,
  onFormDataChange,
  availableTags,
  availableUsers,
  isSubmitting,
  onSubmit,
  onCancel,
  expectedAnswerTime,
  currentUserId,
}: QuestionFormProps): React.ReactNode {
  const handleTagToggle = useCallback(
    (tagId: string) => {
      onFormDataChange((prevData) => ({
        ...prevData,
        tagIds: prevData.tagIds.includes(tagId)
          ? prevData.tagIds.filter((id) => id !== tagId)
          : [...prevData.tagIds, tagId],
      }));
    },
    [onFormDataChange],
  );

  const handleUserToggle = useCallback(
    (userId: string) => {
      onFormDataChange((prevData) => ({
        ...prevData,
        assigneeIds: prevData.assigneeIds.includes(userId)
          ? prevData.assigneeIds.filter((id) => id !== userId)
          : [...prevData.assigneeIds, userId],
      }));
    },
    [onFormDataChange],
  );

  // Auto-assign current user if no assignees selected
  const effectiveAssigneeIds =
    formData.assigneeIds.length > 0
      ? formData.assigneeIds
      : currentUserId
        ? [currentUserId]
        : [];

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Question Details */}
      <Card>
        <CardHeader>
          <CardTitle>Question Details</CardTitle>
          <CardDescription>
            Provide a clear title and description for your question
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="What do you need help with?"
              value={formData.title}
              onChange={(e) =>
                onFormDataChange((prev) => ({ ...prev, title: e.target.value }))
              }
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Description *</Label>
            <TiptapEditor
              value={formData.content}
              onChange={(html, plaintext) =>
                onFormDataChange((prev) => ({
                  ...prev,
                  content: html,
                  contentPlaintext: plaintext,
                }))
              }
              placeholder="Provide more details about your question..."
              minHeight={120}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tags Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Tags *</CardTitle>
          <CardDescription>
            Select tags to categorize your question and determine answer timing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TagSelector
            tags={availableTags}
            selectedTagIds={formData.tagIds}
            onTagToggle={handleTagToggle}
            expectedAnswerTime={expectedAnswerTime}
          />
        </CardContent>
      </Card>

      {/* Assignees Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Assignees *</CardTitle>
          <CardDescription>
            Who should answer this question? At least one assignee is required.
            {effectiveAssigneeIds.length === 0 &&
              " You will be automatically assigned if no one is selected."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserSelector
            selectedUserIds={formData.assigneeIds}
            onUserToggle={handleUserToggle}
            availableUsers={availableUsers.filter(
              (user) => user.id !== currentUserId,
            )}
            placeholder="Search for team members to assign..."
            maxSelections={5}
          />
          {effectiveAssigneeIds.length > 0 &&
            currentUserId &&
            !formData.assigneeIds.includes(currentUserId) && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  💡 You'll be automatically added as a participant to follow
                  the discussion.
                </p>
              </div>
            )}
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={
            isSubmitting ||
            formData.tagIds.length === 0 ||
            !formData.title.trim() ||
            !formData.content.trim() ||
            effectiveAssigneeIds.length === 0
          }
          className="min-w-[120px]"
        >
          {isSubmitting ? "Creating..." : "Create Question"}
        </Button>
      </div>
    </form>
  );
}
