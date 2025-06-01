import { getAllOrThrow } from "convex-helpers/server/relationships";
import { ConvexError, v } from "convex/values";

import type { Id } from "../_generated/dataModel";

import { mutation, type MutationCtx, query, type QueryCtx } from "../context";
import { getProjectHelper } from "./projects";

export const listProjectExperiments = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    await getProjectHelper(ctx, args.projectId);
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
    const experiment = await getExperimentHelper(ctx, args.id);
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
    await getProjectHelper(ctx, args.projectId);
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
    await getExperimentHelper(ctx, args.id);
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
    await getExperimentHelper(ctx, id);
    await ctx.db.patch(id, args);
  },
});

export async function getExperimentHelper(
  ctx: MutationCtx | QueryCtx,
  id: Id<"experiments">,
) {
  const experiment = await ctx.db.get(id);
  if (!experiment) throw new ConvexError("Experiment not found");
  if (experiment.organizationId !== ctx.identity.organization.id)
    throw new ConvexError("User is not authorized to view this experiment");
  return experiment;
}
