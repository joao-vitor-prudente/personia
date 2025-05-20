import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getIdentityOrThrow } from "./helpers";

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
    if (persona.organizationId !== identity.organization.id)
      throw new Error("User is not authorized to view this persona");
    return persona;
  },
});

export const editPersona = mutation({
  args: {
    background: v.string(),
    demographicProfile: v.object({
      age: v.number(),
      country: v.string(),
      gender: v.union(v.literal("male"), v.literal("female")),
      occupation: v.string(),
      state: v.string(),
    }),
    id: v.id("personas"),
    name: v.string(),
    nickname: v.string(),
    quote: v.string(),
  },
  handler: async (ctx, { id, ...args }) => {
    const identity = await getIdentityOrThrow(ctx);
    const persona = await ctx.db.get(id);
    if (!persona) throw new Error("Persona not found");
    if (persona.organizationId !== identity.organization.id)
      throw new Error("User is not authorized to edit this persona");
    await ctx.db.patch(id, args);
  },
});
