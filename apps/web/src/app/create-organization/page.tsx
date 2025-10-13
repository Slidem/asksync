"use client";

import { CreateOrganization, useOrganization } from "@clerk/nextjs";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateOrganizationPage() {
  const router = useRouter();
  const { organization } = useOrganization();

  useEffect(() => {
    if (organization) {
      router.push("/");
    }
  }, [organization, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <CreateOrganization
        routing="path"
        path="/create-organization"
        afterCreateOrganizationUrl={"/"}
      />
    </div>
  );
}
