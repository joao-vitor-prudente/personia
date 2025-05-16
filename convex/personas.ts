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
    background: v.string(),
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
  args: {
    search: v.string(),
    sorting: v.union(v.literal("asc"), v.literal("desc")),
  },
  handler: async (ctx, args) => {
    const identity = await getIdentityOrThrow(ctx);
    const personas = await ctx.db
      .query("personas")
      .withIndex("organizationId", (q) =>
        q.eq("organizationId", identity.organization.id),
      )
      .order(args.sorting)
      .collect();

    return personas.filter(
      (p) =>
        p.name.toLowerCase().includes(args.search.toLowerCase()) ||
        p.nickname.toLowerCase().includes(args.search.toLowerCase()),
    );
  },
});

export const getPersona = query({
  args: { id: v.id("personas") },
  handler: async (ctx, args) => {
    const identity = await getIdentityOrThrow(ctx);
    const persona = await ctx.db.get(args.id);
    if (!persona) throw new Error("Persona not found");
    if (persona.organizationId === identity.organization.id) return persona;
    throw new Error("User is not authorized to view this persona");
  },
});

async function getIdentityOrThrow(ctx: ActionCtx | MutationCtx | QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) throw new Error("User is not signed in");
  const [id, role] = Object.entries(identity.organizations)[0];
  return { ...identity, organization: { id, role } };
}
