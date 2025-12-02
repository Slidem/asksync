import {
  UnderlineTabs,
  UnderlineTabsList,
  UnderlineTabsTrigger,
} from "@/components/ui/UnderlineTabs";

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
      <UnderlineTabsList className="grid w-full grid-cols-3">
        <UnderlineTabsTrigger value="assigned" badge={stats?.assigned}>
          Assigned to me
        </UnderlineTabsTrigger>
        <UnderlineTabsTrigger value="created" badge={stats?.created}>
          Asked by me
        </UnderlineTabsTrigger>
        <UnderlineTabsTrigger value="participating" badge={stats?.participating}>
          Participating in
        </UnderlineTabsTrigger>
      </UnderlineTabsList>
      {children}
    </UnderlineTabs>
  );
}
