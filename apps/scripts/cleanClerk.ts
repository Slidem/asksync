#!/usr/bin/env tsx

import { config } from "dotenv";
import { createClerkClient } from "@clerk/backend";

// Load environment variables
config({ path: ".env.local" });

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

const DRY_RUN = process.env.DRY_RUN === "true";

async function deleteAllUsers() {
  console.log("🔍 Fetching all users...");

  try {
    const users = await clerk.users.getUserList();
    console.log(`📊 Found ${users.totalCount} users`);

    if (users.totalCount === 0) {
      console.log("✅ No users to delete");
      return;
    }

    if (DRY_RUN) {
      console.log("🔍 DRY RUN: Would delete the following users:");
      users.data.forEach((user) => {
        console.log(
          `  - ${user.id} (${
            user.emailAddresses[0]?.emailAddress || "No email"
          })`,
        );
      });
      return;
    }

    console.log("🗑️  Deleting users...");
    for (const user of users.data) {
      try {
        await clerk.users.deleteUser(user.id);
        console.log(
          `  ✅ Deleted user: ${user.id} (${
            user.emailAddresses[0]?.emailAddress || "No email"
          })`,
        );
      } catch (error) {
        console.error(`  ❌ Failed to delete user ${user.id}:`, error);
      }
    }

    console.log("✅ All users deleted successfully");
  } catch (error) {
    console.error("❌ Error fetching users:", error);
  }
}

async function deleteAllOrganizations() {
  console.log("🔍 Fetching all organizations...");

  try {
    const organizations = await clerk.organizations.getOrganizationList();
    console.log(`📊 Found ${organizations.totalCount} organizations`);

    if (organizations.totalCount === 0) {
      console.log("✅ No organizations to delete");
      return;
    }

    if (DRY_RUN) {
      console.log("🔍 DRY RUN: Would delete the following organizations:");
      organizations.data.forEach((org) => {
        console.log(`  - ${org.id} (${org.name})`);
      });
      return;
    }

    console.log("🗑️  Deleting organizations...");
    for (const org of organizations.data) {
      try {
        await clerk.organizations.deleteOrganization(org.id);
        console.log(`  ✅ Deleted organization: ${org.id} (${org.name})`);
      } catch (error) {
        console.error(`  ❌ Failed to delete organization ${org.id}:`, error);
      }
    }

    console.log("✅ All organizations deleted successfully");
  } catch (error) {
    console.error("❌ Error fetching organizations:", error);
  }
}

async function main() {
  console.log("🧹 Clerk Data Cleanup Script");
  console.log("============================");

  if (!process.env.CLERK_SECRET_KEY) {
    console.error("❌ Missing CLERK_SECRET_KEY environment variable");
    process.exit(1);
  }

  if (DRY_RUN) {
    console.log("🔍 Running in DRY RUN mode - no actual deletions will occur");
  } else {
    console.log(
      "⚠️  WARNING: This will permanently delete ALL users and organizations!",
    );
    console.log("   Set DRY_RUN=true in .env.local to preview actions first");

    // Give user 5 seconds to cancel
    console.log("⏰ Starting in 5 seconds... (Press Ctrl+C to cancel)");
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  console.log("");

  try {
    // Delete organizations first (they may have dependencies on users)
    await deleteAllOrganizations();
    console.log("");

    // Then delete users
    await deleteAllUsers();

    console.log("");
    console.log("🎉 Cleanup completed successfully!");
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Operation cancelled by user");
  process.exit(0);
});

if (require.main === module) {
  main().catch((error) => {
    console.error("💥 Unhandled error:", error);
    process.exit(1);
  });
}
