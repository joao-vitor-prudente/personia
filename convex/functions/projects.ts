import { v } from "convex/values";

import { mutation, query } from "../context";
import { getProjectHelper } from "../helpers/projects";

export const createProject = mutation({
  args: {
    category: v.string(),
    name: v.string(),
    objective: v.string(),
    situation: v.string(),
    targetAudience: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("projects", {
      ...args,
      organizationId: ctx.identity.organization.id,
    });
  },
});

export const listProjects = query({
  args: {
    search: v.string(),
    sorting: v.union(v.literal("asc"), v.literal("desc")),
  },
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("organizationId", (q) =>
        q.eq("organizationId", ctx.identity.organization.id),
      )
      .order(args.sorting)
      .collect();

    return projects.filter((p) =>
      p.name.toLowerCase().includes(args.search.toLowerCase()),
    );
  },
});

export const getProject = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    return await getProjectHelper(ctx, args.id);
  },
});

export const editProject = mutation({
  args: {
    category: v.string(),
    id: v.id("projects"),
    name: v.string(),
    objective: v.string(),
    situation: v.string(),
    targetAudience: v.string(),
  },
  handler: async (ctx, { id, ...args }) => {
    await getProjectHelper(ctx, id);
    await ctx.db.patch(id, args);
  },
});

export const deleteProject = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    await getProjectHelper(ctx, args.id);
    await ctx.db.delete(args.id);
  },
});
