"use client";

import { useMemo, useState } from "react";
import { useOrganization, useUser } from "@clerk/nextjs";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateQuestionForm } from "@asksync/shared";
import Link from "next/link";
import { QuestionForm } from "@/questions/components/QuestionForm";
import { api } from "@convex/api";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useTags } from "@/tags/hooks/queries";

export default function NewQuestionPage() {
  const router = useRouter();
  const { user } = useUser();
  const { memberships } = useOrganization({
    memberships: {
      infinite: true,
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateQuestionForm>({
    title: "",
    content: "",
    tagIds: [],
    assigneeIds: [],
    participants: [],
  });

  // Get available tags
  const { tags } = useTags({});
  const createQuestion = useMutation(api.questions.createQuestion);

  // Get organization members from Clerk - memoized to prevent infinite re-renders
  const availableUsers = useMemo(
    () =>
      memberships?.data
        ?.map((membership) => {
          const userData = membership.publicUserData;
          if (!userData || !userData.userId) return null;
          return {
            id: userData.userId,
            name:
              userData.firstName && userData.lastName
                ? `${userData.firstName} ${userData.lastName}`
                : userData.identifier || "Unknown User",
            email: userData.identifier || "",
            imageUrl: userData.imageUrl || "",
          };
        })
        .filter((user) => user !== null) || [],
    [memberships?.data],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Question title is required");
      return;
    }

    if (!formData.content.trim()) {
      toast.error("Question description is required");
      return;
    }

    if (formData.tagIds.length === 0) {
      toast.error("At least one tag is required");
      return;
    }

    if (formData.assigneeIds.length === 0) {
      toast.error("At least one assignee is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const questionId = await createQuestion({
        title: formData.title,
        content: formData.content,
        tagIds: formData.tagIds,
        assigneeIds: formData.assigneeIds,
        participants: formData.participants,
      });

      toast.success("Question created successfully!");
      router.push(`/questions/${questionId}`);
    } catch (error) {
      console.error("Error creating question:", error);
      toast.error("Failed to create question. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const expectedAnswerTime = useMemo(() => {
    if (formData.tagIds.length === 0 || !tags) return null;

    const selectedTags = tags.filter((tag) => formData.tagIds.includes(tag.id));
    let shortestTime = Infinity;

    for (const tag of selectedTags) {
      if (tag.answerMode === "on-demand" && tag.responseTimeMinutes) {
        shortestTime = Math.min(shortestTime, tag.responseTimeMinutes);
      } else if (tag.answerMode === "scheduled") {
        // Default to 24 hours for scheduled tags
        shortestTime = Math.min(shortestTime, 24 * 60);
      }
    }

    if (shortestTime === Infinity) {
      shortestTime = 24 * 60; // Default to 24 hours
    }

    const expectedTime = new Date(Date.now() + shortestTime * 60 * 1000);
    return expectedTime;
  }, [formData.tagIds, tags]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-4">
            <Link href="/questions">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Questions
              </Button>
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">Ask a Question</h1>
            <p className="text-muted-foreground">
              Get help from your team members
            </p>
          </div>
        </div>

        <QuestionForm
          formData={formData}
          onFormDataChange={setFormData}
          availableTags={tags}
          availableUsers={availableUsers}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/questions")}
          expectedAnswerTime={expectedAnswerTime}
          currentUserId={user?.id}
        />
      </div>
    </div>
  );
}
