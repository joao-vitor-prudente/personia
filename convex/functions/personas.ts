import { v } from "convex/values";

import { mutation, query } from "../context";
import { getPersonaHelper } from "../helpers/personas";

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
    return await ctx.db.insert("personas", {
      ...args,
      organizationId: ctx.identity.organization.id,
    });
  },
});

export const listPersonas = query({
  args: {
    search: v.string(),
    sorting: v.union(v.literal("asc"), v.literal("desc")),
  },
  handler: async (ctx, args) => {
    const personas = await ctx.db
      .query("personas")
      .withIndex("organizationId", (q) =>
        q.eq("organizationId", ctx.identity.organization.id),
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
    return await getPersonaHelper(ctx, args.id);
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
    await getPersonaHelper(ctx, id);
    await ctx.db.patch(id, args);
  },
});

export const deletePersona = mutation({
  args: { id: v.id("personas") },
  handler: async (ctx, args) => {
    await getPersonaHelper(ctx, args.id);
    await ctx.db.delete(args.id);
  },
});
