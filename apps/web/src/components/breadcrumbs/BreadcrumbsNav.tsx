"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { sidebarItems } from "@/components/sidebar/config";
import { usePathname } from "next/navigation";

export function BreadcrumbsNav() {
  const pathname = usePathname();
  const pathnameWithoutTrailingSlash = pathname?.replace(/\/$/, "") || "/";

  const currentRoute = sidebarItems.find(
    (route) => route.path === pathnameWithoutTrailingSlash,
  );

  if (!currentRoute) {
    return null;
  }

  const IconComponent = currentRoute.icon;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        {pathname !== "/" && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center gap-2">
                <IconComponent className="h-4 w-4" />
                {currentRoute.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
