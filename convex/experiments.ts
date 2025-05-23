import { getAllOrThrow } from "convex-helpers/server/relationships";
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
  _identity?: Awaited<ReturnType<typeof getIdentityOrThrow>>,
) {
  const identity = _identity ?? (await getIdentityOrThrow(ctx));
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
    const experiments = await ctx.db
      .query("experiments")
      .withIndex("projectId", (q) => q.eq("projectId", args.projectId))
      .collect();
    const personas = await getAllOrThrow(
      ctx.db,
      experiments.flatMap((e) => e.personas),
    );

    return experiments.map((e) => ({
      ...e,
      personas: personas.filter((p) => e.personas.includes(p._id)),
    }));
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
    const experiment = await _getExperiment(ctx, args.id);
    const personas = await getAllOrThrow(ctx.db, experiment.personas);
    return { ...experiment, personas };
  },
});

export const createExperiment = mutation({
  args: {
    name: v.string(),
    personas: v.array(v.id("personas")),
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const identity = await getIdentityOrThrow(ctx);
    await getExperimentProject(ctx, args.projectId, identity);

    return await ctx.db.insert("experiments", {
      name: args.name,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      owner: identity.email!,
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

export const editExperiment = mutation({
  args: {
    id: v.id("experiments"),
    name: v.string(),
    personas: v.array(v.id("personas")),
  },
  handler: async (ctx, { id, ...args }) => {
    await _getExperiment(ctx, id);
    await ctx.db.patch(id, args);
  },
});