import { getAllOrThrow } from "convex-helpers/server/relationships";
import { doc } from "convex-helpers/validators";
import { ConvexError, v } from "convex/values";

import { internal } from "../_generated/api";
import {
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
} from "../context";
import {
  model,
  templateAssistantDescription,
  templateAssistantInstructions,
  templateAssistantName,
} from "../helpers/assistants";
import { workflow } from "../index";
import schema from "../schema";

export const createExperiments = mutation({
  args: {
    name: v.string(),
    personaIds: v.array(v.id("personas")),
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const user = {
      email: ctx.identity.email,
      organizationId: ctx.identity.organization.id,
    };

    await workflow.start(
      ctx,
      internal.workflows.createExperiments.createExperimentWorkflow,
      { user, ...args },
    );
  },
});

export const createExperimentWorkflow = workflow.define({
  args: {
    name: v.string(),
    personaIds: v.array(v.id("personas")),
    projectId: v.id("projects"),
    user: v.object({ email: v.string(), organizationId: v.string() }),
  },
  handler: async (step, args) => {
    const personas = await step.runQuery(
      internal.workflows.createExperiments.getPersonas,
      { ids: args.personaIds, user: args.user },
    );
    const project = await step.runQuery(
      internal.workflows.createExperiments.getProject,
      { id: args.projectId, user: args.user },
    );
    const experimentId = await step.runMutation(
      internal.workflows.createExperiments._createExperiment,
      args,
    );
    const tasks = personas.map(async (persona) => {
      const assistantId = await step.runMutation(
        internal.workflows.createExperiments.createPendingAssistant,
        {
          experimentId,
          personaId: persona._id,
          projectId: project._id,
        },
      );
      const openaiAssistantId = await step.runAction(
        internal.workflows.createExperiments.createOpenaiAssistant,
        {
          experiment: { _id: experimentId, name: args.name },
          persona,
          project,
        },
      );
      await step.runMutation(
        internal.workflows.createExperiments.updateAssistantStatus,
        {
          assistantId,
          openaiAssistantId,
        },
      );
    });
    await Promise.all(tasks);
  },
});

export const _createExperiment = internalMutation({
  args: {
    name: v.string(),
    personaIds: v.array(v.id("personas")),
    projectId: v.id("projects"),
    user: v.object({ email: v.string(), organizationId: v.string() }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("experiments", {
      name: args.name,
      organizationId: args.user.organizationId,
      owner: args.user.email,
      personaIds: args.personaIds,
      projectId: args.projectId,
    });
  },
});

export const getPersonas = internalQuery({
  args: {
    ids: v.array(v.id("personas")),
    user: v.object({ email: v.string(), organizationId: v.string() }),
  },
  handler: async (ctx, args) => {
    const personas = await getAllOrThrow(ctx.db, args.ids);
    const areAllInOrganization = personas.every(
      (p) => p.organizationId === args.user.organizationId,
    );
    if (!areAllInOrganization)
      throw new ConvexError("User is not authorized to view those personas.");
    return personas;
  },
});

export const getProject = internalQuery({
  args: {
    id: v.id("projects"),
    user: v.object({ email: v.string(), organizationId: v.string() }),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id);
    if (!project) throw new ConvexError("Project not found");
    if (project.organizationId !== args.user.organizationId)
      throw new ConvexError("User is not authorized to view this project");
    return project;
  },
});

export const createPendingAssistant = internalMutation({
  args: {
    experimentId: v.id("experiments"),
    personaId: v.id("personas"),
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("assistants", {
      ...args,
      openai: { status: "pending" },
    });
  },
});

export const updateAssistantStatus = internalMutation({
  args: {
    assistantId: v.id("assistants"),
    openaiAssistantId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.assistantId, {
      openai: { assistantId: args.assistantId, status: "finished" },
    });
  },
});

export const createOpenaiAssistant = internalAction({
  args: {
    experiment: v.object({ _id: v.id("experiments"), name: v.string() }),
    persona: doc(schema, "personas"),
    project: doc(schema, "projects"),
  },
  handler: async (ctx, args) => {
    const assistant = await ctx.openai.beta.assistants.create({
      description: templateAssistantDescription(
        args.persona,
        args.project,
        args.experiment,
      ),
      instructions: templateAssistantInstructions(
        args.persona,
        args.project,
        args.experiment,
      ),
      model,
      name: templateAssistantName(args.persona, args.project, args.experiment),
    });
    return assistant.id;
  },
});
