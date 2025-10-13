"use client";

import * as React from "react";

import {
  BookOpen,
  Calendar1,
  MessageCircleQuestionMark,
  SquareTerminal,
  TagIcon,
  Zap,
} from "lucide-react";
import { OrganizationSwitcher, UserButton, useUser } from "@clerk/nextjs";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";

import { NavMain } from "@/components/sidebar/NavMain";

const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: SquareTerminal,
  },
  {
    title: "Schedule",
    url: "/schedule",
    icon: Calendar1,
  },
  {
    title: "Tags",
    url: "/tags",
    icon: TagIcon,
  },
  {
    title: "Questions",
    url: "/questions",
    icon: MessageCircleQuestionMark,
  },
  {
    title: "Knowledge base",
    url: "/knowledge-base",
    icon: BookOpen,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader className="mb-4">
        <div className="flex flex-col gap-8">
          {/* App branding */}
          <div className="flex items-center gap-3 px-1 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-base font-bold tracking-tight">AskSync</h1>
              <p className="text-xs text-muted-foreground">
                control your attention
              </p>
            </div>
          </div>

          <OrganizationSwitcher
            afterCreateOrganizationUrl="/"
            afterSelectOrganizationUrl="/"
            hidePersonal={true}
            createOrganizationMode="modal"
            appearance={{
              elements: {
                organizationSwitcherTrigger: "w-full",
              },
            }}
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items} />
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-3 p-4 border-t">
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "w-8 h-8",
              },
            }}
          />
          <div className="flex flex-col flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.fullName || "Loading..."}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.emailAddresses?.[0]?.emailAddress || ""}
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
