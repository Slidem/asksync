import {
  UnderlineTabs,
  UnderlineTabsList,
  UnderlineTabsTrigger,
} from "@/components/ui/UnderlineTabs";
import { MessageSquarePlus, UserCheck, Users } from "lucide-react";

import { TabType } from "@/questions/stores/questionsPageStore";

interface QuestionsTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  stats:
    | {
        assigned: number;
        created: number;
        participating: number;
      }
    | undefined;
  children: React.ReactNode;
}

export function QuestionsTabs({
  activeTab,
  onTabChange,
  stats,
  children,
}: QuestionsTabsProps) {
  return (
    <UnderlineTabs
      value={activeTab}
      onValueChange={(value) => onTabChange(value as TabType)}
      className="space-y-6"
    >
      <UnderlineTabsList className="flex w-full sm:grid sm:grid-cols-3">
        <UnderlineTabsTrigger
          value="assigned"
          badge={stats?.assigned}
          icon={<UserCheck className="h-4 w-4" />}
        >
          <span className="max-sm:sr-only">Assigned to me</span>
        </UnderlineTabsTrigger>
        <UnderlineTabsTrigger
          value="created"
          badge={stats?.created}
          icon={<MessageSquarePlus className="h-4 w-4" />}
        >
          <span className="max-sm:sr-only">Asked by me</span>
        </UnderlineTabsTrigger>
        <UnderlineTabsTrigger
          value="participating"
          badge={stats?.participating}
          icon={<Users className="h-4 w-4" />}
        >
          <span className="max-sm:sr-only">Participating in</span>
        </UnderlineTabsTrigger>
      </UnderlineTabsList>
      {children}
    </UnderlineTabs>
  );
}
