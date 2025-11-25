import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Badge } from "@/components/ui/badge";
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
    <Tabs
      value={activeTab}
      onValueChange={(value) => onTabChange(value as TabType)}
      className="space-y-6"
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="assigned" className="relative">
          Assigned to me
          {stats && stats.assigned > 0 ? (
            <Badge variant="secondary" className="ml-2 text-xs">
              {stats.assigned}
            </Badge>
          ) : null}
        </TabsTrigger>
        <TabsTrigger value="created" className="relative">
          Asked by me
          {stats && stats.created > 0 ? (
            <Badge variant="secondary" className="ml-2 text-xs">
              {stats.created}
            </Badge>
          ) : null}
        </TabsTrigger>
        <TabsTrigger value="participating" className="relative">
          Participating in
          {stats && stats.participating > 0 ? (
            <Badge variant="secondary" className="ml-2 text-xs">
              {stats.participating}
            </Badge>
          ) : null}
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
