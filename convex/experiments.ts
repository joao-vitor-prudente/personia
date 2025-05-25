import { getAllOrThrow } from "convex-helpers/server/relationships";
import { v } from "convex/values";

import { mutation, query } from "./context";

export const listProjectExperiments = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");
    if (project.organizationId !== ctx.identity.organization.id)
      throw new Error("User is not authorized to view this project");
    return await ctx.db
      .query("experiments")
      .withIndex("projectId", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const getExperiment = query({
  args: {
    id: v.id("experiments"),
  },
  handler: async (ctx, args) => {
    const experiment = await ctx.db.get(args.id);
    if (!experiment) throw new Error("Experiment not found");
    if (experiment.organizationId !== ctx.identity.organization.id)
      throw new Error("User is not authorized to view this experiment");
    const personas = await getAllOrThrow(ctx.db, experiment.personaIds);
    return { ...experiment, personas };
  },
});

export const createExperiment = mutation({
  args: {
    name: v.string(),
    personaIds: v.array(v.id("personas")),
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");
    if (project.organizationId !== ctx.identity.organization.id)
      throw new Error("User is not authorized to view this project");

    return await ctx.db.insert("experiments", {
      name: args.name,
      organizationId: ctx.identity.organization.id,

      owner: ctx.identity.email,
      personaIds: args.personaIds,
      projectId: args.projectId,
    });
  },
});

export const deleteExperiment = mutation({
  args: {
    id: v.id("experiments"),
  },
  handler: async (ctx, args) => {
    const experiment = await ctx.db.get(args.id);
    if (!experiment) throw new Error("Experiment not found");
    if (experiment.organizationId !== ctx.identity.organization.id)
      throw new Error("User is not authorized to delete this experiment");
    await ctx.db.delete(args.id);
  },
});

export const editExperiment = mutation({
  args: {
    id: v.id("experiments"),
    name: v.string(),
    personaIds: v.array(v.id("personas")),
  },
  handler: async (ctx, { id, ...args }) => {
    const experiment = await ctx.db.get(id);
    if (!experiment) throw new Error("Experiment not found");
    if (experiment.organizationId !== ctx.identity.organization.id)
      throw new Error("User is not authorized to edit this experiment");
    await ctx.db.patch(id, args);
  },
});