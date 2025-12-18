/* eslint-disable import/no-relative-parent-imports */
/* eslint-disable import/order */
import { expect, test, vi } from "vitest";

import { api } from "@/_generated/api";
import { convexTest } from "convex-test";
import schema from "@/schema";
import { testModules } from "../test.setup";

test("Given empty list of tags, when createQuestion is called, then error is thrown", async () => {
  const t = convexTest(schema, testModules);

  vi.mock("@/auth/user", async (importActual) => {
    const actual = await importActual<typeof import("@/auth/user")>();
    return {
      ...actual,
      getUserWithGroups: async () => ({
        id: "user1",
        orgId: "org1",
        groups: [],
      }),
    };
  });

  await expect(
    t.mutation(api.questions.mutations.createQuestion, {
      title: "Test Question",
      content: "This is a test question",
      tagIds: [],
      assigneeIds: ["user1"],
    }),
  ).rejects.toThrow("At least one tag is required");
});
