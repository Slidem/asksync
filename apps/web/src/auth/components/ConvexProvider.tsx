"use client";

import AuthenticatedWrapper from "@/auth/components/AuthenticatedWrapper";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { JSX } from "react";
import UnauthenticatedWrapper from "@/auth/components/UnauthenticatedWrapper";
import { useAuth } from "@clerk/nextjs";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL in your .env file");
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export function ConvexProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <AuthenticatedWrapper>{children}</AuthenticatedWrapper>
      <UnauthenticatedWrapper>{children}</UnauthenticatedWrapper>
    </ConvexProviderWithClerk>
  );
}
