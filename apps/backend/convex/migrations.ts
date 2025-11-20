import { Migrations } from "@convex-dev/migrations";
import { components, internal } from "./_generated/api.js";
import { DataModel } from "./_generated/dataModel.js";
import { internalMutation } from "./_generated/server.js";

export const migrations = new Migrations<DataModel>(components.migrations);

export const migratePublicTagsToPermissions = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Get all tags where isPublic = true
    const publicTags = await ctx.db
      .query("tags")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .collect();

    console.log(`Found ${publicTags.length} public tags to migrate`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const tag of publicTags) {
      // Check if "everyone" permission already exists for this tag
      const existingPermission = await ctx.db
        .query("permissions")
        .filter((q) =>
          q.and(
            q.eq(q.field("resourceType"), "tags"),
            q.eq(q.field("resourceId"), tag._id),
            q.eq(q.field("all"), true),
          ),
        )
        .first();

      if (existingPermission) {
        console.log(
          `Tag "${tag.name}" already has everyone permission, skipping`,
        );
        skippedCount++;
        continue;
      }

      // Create "everyone" view permission
      await ctx.db.insert("permissions", {
        all: true,
        groupId: undefined,
        userId: undefined,
        orgId: tag.orgId,
        resourceType: "tags",
        resourceId: tag._id,
        permission: "view",
        createdBy: tag.createdBy,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      migratedCount++;
      console.log(`Migrated tag "${tag.name}" (${tag._id})`);
    }

    console.log(
      `Migration complete: ${migratedCount} migrated, ${skippedCount} skipped`,
    );

    return {
      totalPublicTags: publicTags.length,
      migratedCount,
      skippedCount,
    };
  },
});

export const runAll = migrations.runner([
  internal.migrations.migratePublicTagsToPermissions,
]);
