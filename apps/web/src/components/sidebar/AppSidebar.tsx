"use client";

import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { OrganizationSwitcher, UserButton, useUser } from "@clerk/nextjs";
import {
  BarChart3,
  Calendar1,
  Mail,
  MessageCircleQuestionMark,
  Settings,
  SquareTerminal,
  TagIcon,
  Timer,
  Users,
} from "lucide-react";

import { NavMain, type NavGroup } from "@/components/sidebar/NavMain";
import { SidebarTimer } from "@/work/components/sidebar/SidebarTimer";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/", icon: SquareTerminal },
      { title: "Analytics", url: "/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Productivity",
    items: [
      { title: "Work Mode", url: "/work", icon: Timer },
      { title: "Schedule", url: "/schedule", icon: Calendar1 },
      { title: "Emails", url: "/emails", icon: Mail, badgeKey: "emails" },
      { title: "Tags", url: "/tags", icon: TagIcon },
    ],
  },
  {
    label: "Communication",
    items: [
      {
        title: "Questions",
        url: "/questions",
        icon: MessageCircleQuestionMark,
        badgeKey: "questions",
      },
    ],
  },
  {
    label: "Team",
    items: [{ title: "Members", url: "/members", icon: Users }],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();
  const pathname = usePathname();
  const isWorkPage = pathname.includes("/work");
  const isSettingsActive = pathname === "/settings";

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader className="mb-4">
        <div className="flex flex-col gap-8">
          {/* App branding */}
          <div className="flex items-center gap-3 px-1 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg">
              <Image
                src="/logo_no_bg_no_text.png"
                alt="AskSync Logo"
                width={40}
                height={40}
              />
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
        <NavMain groups={navGroups} />

        {/* Settings - separate at bottom of nav */}
        <SidebarGroup className="mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Settings"
                isActive={isSettingsActive}
                className="md:h-10 md:text-base"
              >
                <Link href="/settings">
                  <Settings className="md:h-4 md:w-4" />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarTimer hideDisplay={isWorkPage} />
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
