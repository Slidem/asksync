"use client";

import { ReactNode, useEffect } from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useOrganization, useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";

import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { BreadcrumbsNav } from "@/components/breadcrumbs/BreadcrumbsNav";
import { Separator } from "@/components/ui/separator";
import Spinner from "@/components/ui/spinner";

const redirectPages = ["/create-organization", "/accept-invitation"];

interface OrganizationRouterProps {
  children: ReactNode;
}

function OrganizationRouter({ children }: OrganizationRouterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const { organization } = useOrganization();

  const isOnRedirectPage = redirectPages.some((page) =>
    pathname.startsWith(page),
  );

  useEffect(() => {
    if (!user || isOnRedirectPage || organization) {
      return;
    }

    async function getHasPendingInvites() {
      if (!user) return false;
      const invites = await user.getOrganizationInvitations();
      return invites.data.length > 0;
    }

    async function verifyIfShouldRedirect() {
      const hasPendingInvites = await getHasPendingInvites();

      if (!hasPendingInvites) {
        console.info("No organization and no pending invites, redirecting...");
        router.push("/create-organization");
      }

      if (hasPendingInvites) {
        router.push("/accept-invitation");
      }
    }

    verifyIfShouldRedirect();
  }, [isOnRedirectPage, organization, router, user]);

  if (isOnRedirectPage) {
    return <>{children}</>;
  }

  if (organization) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="h-6" />
              <BreadcrumbsNav />
            </div>
          </header>
          {children}
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner />
        <p className="text-sm text-muted-foreground">Loading organization...</p>
      </div>
    </div>
  );
}

export default OrganizationRouter;
