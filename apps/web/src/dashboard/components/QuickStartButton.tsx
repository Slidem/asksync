"use client";

import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useRouter } from "next/navigation";

export function QuickStartButton() {
  const router = useRouter();

  return (
    <Button size="lg" onClick={() => router.push("/work")} className="gap-2">
      <Play className="h-5 w-5" />
      Start Focus Session
    </Button>
  );
}
