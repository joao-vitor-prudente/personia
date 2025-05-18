import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getIdentityOrThrow } from "./helpers";

export const createProject = mutation({
  args: {
    category: v.string(),
    name: v.string(),
    objective: v.string(),
    situation: v.string(),
    targetAudience: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await getIdentityOrThrow(ctx);
    return await ctx.db.insert("projects", {
      ...args,
      organizationId: identity.organization.id,
    });
  },
});

export const listProjects = query({
  args: {
    search: v.string(),
    sorting: v.union(v.literal("asc"), v.literal("desc")),
  },
  handler: async (ctx, args) => {
    const identity = await getIdentityOrThrow(ctx);
    const projects = await ctx.db
      .query("projects")
      .withIndex("organizationId", (q) =>
        q.eq("organizationId", identity.organization.id),
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
    const identity = await getIdentityOrThrow(ctx);
    const project = await ctx.db.get(args.id);
    if (!project) throw new Error("Project not found");
    if (project.organizationId === identity.organization.id) return project;
    throw new Error("User is not authorized to view this project");
  },
});