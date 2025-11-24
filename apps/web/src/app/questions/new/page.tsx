"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateQuestionDialog } from "@/questions/dialogs/createQuestion/CreateQuestionDialog";
import Link from "next/link";
import { useCreateQuestionDialogStore } from "@/questions/dialogs/createQuestion/createQuestionDialogStore";
import { useEffect } from "react";

export default function NewQuestionPage() {
  const { openDialog } = useCreateQuestionDialogStore();

  useEffect(() => {
    openDialog();
  }, [openDialog]);

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

        <CreateQuestionDialog />
      </div>
    </div>
  );
}
