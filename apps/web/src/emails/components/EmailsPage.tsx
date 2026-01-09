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

import { AlertCircle, Mail, Settings2 } from "lucide-react";

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
            <UnderlineTabsTrigger
              value="attention"
              badge={counts.pending}
              icon={<AlertCircle className="h-4 w-4" />}
            >
              <span className="max-sm:sr-only">Needs Your Attention</span>
            </UnderlineTabsTrigger>
            <UnderlineTabsTrigger
              value="rules"
              badge={rules.length}
              icon={<Settings2 className="h-4 w-4" />}
            >
              <span className="max-sm:sr-only">Conversion Rules</span>
            </UnderlineTabsTrigger>
            <UnderlineTabsTrigger
              value="accounts"
              badge={activeConnectionsCount}
              icon={<Mail className="h-4 w-4" />}
            >
              <span className="max-sm:sr-only">Email Accounts</span>
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
