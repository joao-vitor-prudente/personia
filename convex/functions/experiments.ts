import {
  getAllOrThrow,
  getManyFrom,
} from "convex-helpers/server/relationships";
import { v } from "convex/values";

import { mutation, query } from "../context";
import { getExperimentHelper } from "../helpers/experiments";
import { getProjectHelper } from "../helpers/projects";

export const listProjectExperiments = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    await getProjectHelper(ctx, args.projectId);
    const experiments = await getManyFrom(
      ctx.db,
      "experiments",
      "projectId",
      args.projectId,
    );

    return await Promise.all(
      experiments.map(async (experiment) => {
        const personas = await getAllOrThrow(ctx.db, experiment.personaIds);
        const assistants = await getManyFrom(
          ctx.db,
          "assistants",
          "experimentId",
          experiment._id,
        );
        return { ...experiment, assistants, personas };
      }),
    );
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
