"use client";

import {
  ArrowUpDown,
  Check,
  Filter,
  MessageCircleQuestionMark,
  Plus,
  Search,
  Tags,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Question, QuestionFilters } from "@asksync/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { QuestionCard } from "@/questions/components/QuestionCard";
import { api } from "@convex/api";
import { convertConvexQuestions } from "@/lib/convexTypes";
import { useQuery } from "convex/react";
import { useState } from "react";
import { useTags } from "@/tags/hooks/queries";

type TabType = "created" | "assigned" | "participating";

export default function QuestionsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("assigned");
  const [filters, setFilters] = useState<QuestionFilters>({
    search: "",
    status: "all",
    sortBy: "expectedTime",
    tagIds: [],
  });

  const rawQuestions = useQuery(api.questions.listQuestionsByUser, {
    filter: activeTab,
    search: filters.search || undefined,
    status: filters.status !== "all" ? filters.status : undefined,
    tagIds: filters.tagIds,
    sortBy: filters.sortBy,
  });

  const { tags } = useTags({});
  const questions = convertConvexQuestions(rawQuestions || []);

  const isLoading = questions === undefined;
  const questionCount = questions?.length || 0;

  const handleFilterChange = (
    key: keyof QuestionFilters,
    value: string | string[],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const getTabCount = (tabType: TabType) => {
    if (tabType === activeTab) return questionCount;
    // For other tabs, we'd need separate queries or counts
    return "";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <MessageCircleQuestionMark className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Questions</h1>
          </div>
          <Link href="/questions/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ask Question
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabType)}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assigned" className="relative">
              Assigned to me
              {getTabCount("assigned") ? (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {getTabCount("assigned")}
                </Badge>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="created" className="relative">
              Asked by me
              {getTabCount("created") ? (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {getTabCount("created")}
                </Badge>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="participating" className="relative">
              Participating in
              {getTabCount("participating") ? (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {getTabCount("participating")}
                </Badge>
              ) : null}
            </TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={filters.search || ""}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={filters.status || "all"}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger className="w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unanswered">Unanswered</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="answered">Answered</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.sortBy || "expectedTime"}
              onValueChange={(value) => handleFilterChange("sortBy", value)}
            >
              <SelectTrigger className="w-[160px]">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expectedTime">Answer Time</SelectItem>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="updatedAt">Last Updated</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[160px] justify-start">
                  <Tags className="h-4 w-4 mr-2" />
                  {filters.tagIds?.length
                    ? `${filters.tagIds.length} tag${
                        filters.tagIds.length > 1 ? "s" : ""
                      }`
                    : "All Tags"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0" align="start">
                <div className="p-2 space-y-1">
                  <button
                    className="flex items-center gap-2 w-full p-2 text-sm hover:bg-muted rounded-sm"
                    onClick={() => handleFilterChange("tagIds", [])}
                  >
                    <div className="w-4 h-4" />
                    All Tags
                  </button>
                  {tags?.map((tag) => {
                    const isSelected =
                      filters.tagIds?.includes(tag.id) || false;
                    return (
                      <button
                        key={tag.id}
                        className="flex items-center gap-2 w-full p-2 text-sm hover:bg-muted rounded-sm"
                        onClick={() => {
                          const currentTagIds = filters.tagIds || [];
                          const newTagIds = isSelected
                            ? currentTagIds.filter((id) => id !== tag.id)
                            : [...currentTagIds, tag.id];
                          handleFilterChange("tagIds", newTagIds);
                        }}
                      >
                        {isSelected && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                        {!isSelected && <div className="w-4 h-4" />}
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Tag Filter Pills */}
          {tags && filters.tagIds && filters.tagIds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground self-center">
                Tags:
              </span>
              {filters.tagIds.map((tagId) => {
                const tag = tags.find((t) => t.id === tagId);
                if (!tag) return null;
                return (
                  <Badge
                    key={tagId}
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-1"
                    style={{
                      borderColor: tag.color,
                      color: tag.color,
                      backgroundColor: `${tag.color}15`,
                    }}
                  >
                    {tag.name}
                    <button
                      onClick={() => {
                        const newTagIds =
                          filters.tagIds?.filter((id) => id !== tagId) || [];
                        handleFilterChange("tagIds", newTagIds);
                      }}
                      className="ml-1 hover:bg-background rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
              <button
                onClick={() => handleFilterChange("tagIds", [])}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Tab Contents */}
          <TabsContent value="assigned" className="space-y-4">
            <QuestionsList
              questions={questions}
              isLoading={isLoading}
              emptyMessage="No questions assigned to you yet."
            />
          </TabsContent>

          <TabsContent value="created" className="space-y-4">
            <QuestionsList
              questions={questions}
              isLoading={isLoading}
              emptyMessage="You haven't asked any questions yet."
            />
          </TabsContent>

          <TabsContent value="participating" className="space-y-4">
            <QuestionsList
              questions={questions}
              isLoading={isLoading}
              emptyMessage="You're not participating in any questions yet."
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface QuestionsListProps {
  questions: Question[] | undefined;
  isLoading: boolean;
  emptyMessage: string;
}

function QuestionsList({
  questions,
  isLoading,
  emptyMessage,
}: QuestionsListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <span className="text-muted-foreground">Loading questions...</span>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <MessageCircleQuestionMark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No questions found</h3>
            <p className="text-muted-foreground">{emptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <QuestionCard key={question.id} question={question} />
      ))}
    </div>
  );
}
