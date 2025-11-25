import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function QuestionPageHeader() {
  return (
    <div className="flex items-center gap-4 mb-6">
      <Link href="/questions">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Questions
        </Button>
      </Link>
    </div>
  );
}
