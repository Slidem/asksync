import { Auth } from "convex/server";

export const getUser = async (ctx: { auth: Auth }) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  // org id is added as a custom claim in the JWT in clerk
  const orgId = identity.orgId;

  if (!orgId || typeof orgId !== "string") {
    throw new Error("No active organization");
  }

  return {
    id: identity.subject,
    email: identity.email,
    name: identity.name,
    orgId: orgId,
  };
};
