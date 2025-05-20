import { v } from "convex/values";

import { type Id } from "./_generated/dataModel";
import {
  mutation,
  type MutationCtx,
  query,
  type QueryCtx,
} from "./_generated/server";
import { getIdentityOrThrow } from "./helpers";

async function getExperimentProject(
  ctx: MutationCtx | QueryCtx,
  projectId: Id<"projects">,
) {
  const identity = await getIdentityOrThrow(ctx);
  const project = await ctx.db.get(projectId);
  if (project?.organizationId !== identity.organization.id)
    throw new Error("User is not authorized to view this project");
  return project;
}

export const listProjectExperiments = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    await getExperimentProject(ctx, args.projectId);
    return await ctx.db
      .query("experiments")
      .withIndex("projectId", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

async function _getExperiment(
  ctx: MutationCtx | QueryCtx,
  experimentId: Id<"experiments">,
) {
  const identity = await getIdentityOrThrow(ctx);
  const experiment = await ctx.db.get(experimentId);
  if (!experiment) throw new Error("Experiment not found");
  const project = await ctx.db.get(experiment.projectId);
  if (!project) throw new Error("Project not found");
  if (project.organizationId !== identity.organization.id)
    throw new Error("User is not authorized to view this experiment");
  return experiment;
}

export const getExperiment = query({
  args: {
    id: v.id("experiments"),
  },
  handler: async (ctx, args) => {
    return await _getExperiment(ctx, args.id);
  },
});

export const createExperiment = mutation({
  args: {
    name: v.string(),
    personas: v.array(v.id("personas")),
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    await getExperimentProject(ctx, args.projectId);
    return await ctx.db.insert("experiments", {
      name: args.name,
      personas: args.personas,
      projectId: args.projectId,
    });
  },
});

export const deleteExperiment = mutation({
  args: {
    id: v.id("experiments"),
  },
  handler: async (ctx, args) => {
    await _getExperiment(ctx, args.id);
    await ctx.db.delete(args.id);
  },
});