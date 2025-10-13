import { query } from "../_generated/server";
import { getUser } from "../auth/user";

/**
 * Get all tags for the current organization
 */
export const listTagsByOrg = query({
  handler: async (ctx) => {
    const { orgId } = await getUser(ctx);

    const tagsQuery = ctx.db
      .query("tags")
      .withIndex("by_org", (q) => q.eq("orgId", orgId));

    const tags = await tagsQuery.collect();

    return tags.sort((a, b) => a.name.localeCompare(b.name));
  },
});
