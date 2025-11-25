import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      <TabsList className="grid w-full grid-cols-3 bg-transparent border-b h-auto p-0 rounded-none gap-0">
        <TabsTrigger
          value="assigned"
          className="relative rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground py-3 px-4 transition-colors hover:text-foreground"
        >
          Assigned to me
          {stats && stats.assigned > 0 && (
            <span className="ml-2 px-1.5 py-0.5 text-xs rounded-md bg-muted text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              {stats.assigned}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="created"
          className="relative rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground py-3 px-4 transition-colors hover:text-foreground"
        >
          Asked by me
          {stats && stats.created > 0 && (
            <span className="ml-2 px-1.5 py-0.5 text-xs rounded-md bg-muted text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              {stats.created}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="participating"
          className="relative rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground py-3 px-4 transition-colors hover:text-foreground"
        >
          Participating in
          {stats && stats.participating > 0 && (
            <span className="ml-2 px-1.5 py-0.5 text-xs rounded-md bg-muted text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              {stats.participating}
            </span>
          )}
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
