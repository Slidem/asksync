import { ConvexReactClient } from "convex/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;

if (!convexUrl) {
  throw new Error(
    "Missing NEXT_PUBLIC_CONVEX_URL environment variable. " +
      "Make sure you have run `npx convex dev` in your backend and copied the URL to your .env.local file.",
  );
}

export const convex = new ConvexReactClient(convexUrl);
