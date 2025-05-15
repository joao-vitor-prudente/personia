import { v } from "convex/values";

import {
  type ActionCtx,
  mutation,
  type MutationCtx,
  query,
  type QueryCtx,
} from "./_generated/server";

export const createPersona = mutation({
  args: {
    demographicProfile: v.object({
      age: v.number(),
      country: v.string(),
      gender: v.union(v.literal("male"), v.literal("female")),
      occupation: v.string(),
      state: v.string(),
    }),
    name: v.string(),
    nickname: v.string(),
    quote: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await getIdentityOrThrow(ctx);
    return await ctx.db.insert("personas", {
      ...args,
      organizationId: identity.organization.id,
    });
  },
});

export const listPersonas = query({
  handler: async (ctx) => {
    const identity = await getIdentityOrThrow(ctx);
    return await ctx.db
      .query("personas")
      .filter((q) => q.eq(q.field("organizationId"), identity.organization.id))
      .collect();
  },
});

async function getIdentityOrThrow(ctx: ActionCtx | MutationCtx | QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) throw new Error("User is not signed in");
  const [id, role] = Object.entries(identity.organizations)[0];
  return { ...identity, organization: { id, role } };
}
