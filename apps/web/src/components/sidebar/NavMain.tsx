"use client";

import { useState } from "react";
import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export function NavMain({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    // All groups open by default
    return groups.reduce(
      (acc, group) => {
        acc[group.label] = true;
        return acc;
      },
      {} as Record<string, boolean>
    );
  });

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <>
      {groups.map((group) => (
        <Collapsible
          key={group.label}
          open={openGroups[group.label]}
          onOpenChange={() => toggleGroup(group.label)}
        >
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full cursor-pointer items-center justify-between">
                {group.label}
                <ChevronRight
                  className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-90"
                  data-state={openGroups[group.label] ? "open" : "closed"}
                />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        isActive={isActive}
                        className="md:h-10 md:text-base"
                      >
                        <Link href={item.url}>
                          <item.icon className="md:h-4 md:w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      ))}
    </>
  );
}
