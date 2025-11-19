import { Migrations } from "@convex-dev/migrations";
import { components, internal } from "./_generated/api.js";
import { DataModel } from "./_generated/dataModel.js";

export const migrations = new Migrations<DataModel>(components.migrations);

export const addCreatorPermissionsToTimeblocks = migrations.define({
  table: "timeblocks",
  migrateOne: async (ctx, timeblock) => {
    const orgId = timeblock.orgId;
    const resourceId = timeblock._id;
    const permissions = await ctx.db
      .query("permissions")
      .withIndex("by_org_and_type_and_resourceId", (q) =>
        q
          .eq("orgId", orgId)
          .eq("resourceType", "timeblocks")
          .eq("resourceId", resourceId),
      )
      .collect();

    const creatorPermission = permissions.find(
      (perm) => perm.userId === timeblock.createdBy,
    );

    if (!creatorPermission) {
      await ctx.db.insert("permissions", {
        all: false,
        userId: timeblock.createdBy,
        orgId,
        resourceType: "timeblocks",
        resourceId,
        permission: "manage",
        createdBy: timeblock.createdBy,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    if (creatorPermission && creatorPermission.permission !== "manage") {
      await ctx.db.patch(creatorPermission._id, {
        permission: "manage",
        updatedAt: Date.now(),
      });
    }
  },
});

export const addCreatorPermissionsToTags = migrations.define({
  table: "tags",
  migrateOne: async (ctx, tag) => {
    const orgId = tag.orgId;
    const resourceId = tag._id;
    const permissions = await ctx.db
      .query("permissions")
      .withIndex("by_org_and_type_and_resourceId", (q) =>
        q
          .eq("orgId", orgId)
          .eq("resourceType", "tags")
          .eq("resourceId", resourceId),
      )
      .collect();

    const creatorPermission = permissions.find(
      (perm) => perm.userId === tag.createdBy,
    );

    if (!creatorPermission) {
      await ctx.db.insert("permissions", {
        all: false,
        userId: tag.createdBy,
        orgId,
        resourceType: "tags",
        resourceId,
        permission: "manage",
        createdBy: tag.createdBy,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    if (creatorPermission && creatorPermission.permission !== "manage") {
      await ctx.db.patch(creatorPermission._id, {
        permission: "manage",
        updatedAt: Date.now(),
      });
    }
  },
});

export const runAll = migrations.runner([
  internal.migrations.addCreatorPermissionsToTimeblocks,
  internal.migrations.addCreatorPermissionsToTags,
]);
