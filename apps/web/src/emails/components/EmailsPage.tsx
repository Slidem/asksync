"use client";

import {
  UnderlineTabs,
  UnderlineTabsContent,
  UnderlineTabsList,
  UnderlineTabsTrigger,
} from "@/components/ui/UnderlineTabs";
import {
  useAttentionItemCounts,
  useConversionRules,
  useGmailConnections,
} from "@/emails/hooks/queries";

import { AttentionItemsList } from "./AttentionItemsList";
import { EmailAccountsTab } from "./EmailAccountsTab";
import { RulesList } from "./RulesList";
import { useState } from "react";

type TabValue = "attention" | "rules" | "accounts";

export function EmailsPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("attention");
  const { counts } = useAttentionItemCounts();
  const { rules } = useConversionRules();
  const { connections } = useGmailConnections();

  const activeConnectionsCount = connections.filter(
    (c) => c.syncStatus !== "disconnected",
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Emails</h2>
      </div>

      {/* Tabs */}
      <UnderlineTabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabValue)}
      >
        <div className="flex justify-center">
          <UnderlineTabsList>
            <UnderlineTabsTrigger value="attention" badge={counts.pending}>
              Needs Your Attention
            </UnderlineTabsTrigger>
            <UnderlineTabsTrigger value="rules" badge={rules.length}>
              Conversion Rules
            </UnderlineTabsTrigger>
            <UnderlineTabsTrigger
              value="accounts"
              badge={activeConnectionsCount}
            >
              Email Accounts
            </UnderlineTabsTrigger>
          </UnderlineTabsList>
        </div>

        <UnderlineTabsContent value="attention">
          <AttentionItemsList />
        </UnderlineTabsContent>

        <UnderlineTabsContent value="rules">
          <RulesList />
        </UnderlineTabsContent>

        <UnderlineTabsContent value="accounts">
          <EmailAccountsTab />
        </UnderlineTabsContent>
      </UnderlineTabs>
    </div>
  );
}
