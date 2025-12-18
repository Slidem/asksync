/* eslint-disable import/no-relative-parent-imports */
/* eslint-disable import/order */
import { expect, test } from "vitest";

import { Id } from "@/_generated/dataModel";
import { convexTest } from "convex-test";
import schema from "@/schema";
import { testModules } from "../test.setup";
import { validateTagPermissions } from "@/questions/helpers";

test("Given empty list of tags, when validateTagPermissions is called, then true is returned", async () => {
  const t = convexTest(schema, testModules);
  await t.run(async (ctx) => {
    const result = await validateTagPermissions(ctx, "org1", "user1", []);
    expect(result).toBe(true);
  });
});

test("Given invalid tag, when validateTagPermissions is called, then false is returned", async () => {
  const t = convexTest(schema, testModules);
  await t.run(async (ctx) => {
    const result = await validateTagPermissions(ctx, "org1", "user1", [
      "tag1" as Id<"tags">,
    ]);
    expect(result).toBe(false);
  });
});

test("Given tag created by current user, then true is returned", async () => {
  const t = convexTest(schema, testModules);
  const testUserId = "user1";
  const testOrg = "org1";

  await t.run(async (ctx) => {
    const mockCtx = {
      ...ctx,
      auth: {
        getUserIdentity: async () => ({
          subject: testUserId,
          orgId: testOrg,
        }),
      },
    };
    // Create tag
    const tagId = await mockCtx.db.insert("tags", {
      orgId: testOrg,
      name: "Test Tag",
      description: "A tag for testing",
      color: "blue",
      answerMode: "on-demand",
      responseTimeMinutes: 30,
      createdBy: testUserId,
      updatedAt: Date.now(),
    });

    const result = await validateTagPermissions(mockCtx, "org1", "user1", [
      tagId,
    ]);

    expect(result).toBe(true);
  });
});
