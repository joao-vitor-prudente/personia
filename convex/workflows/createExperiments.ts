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
    const assistantIds = await step.runAction(
      internal.workflows.createExperiments.createOpenaiAssistants,
      { experiment: { _id: experimentId, name: args.name }, personas, project },
    );
    await step.runMutation(
      internal.workflows.createExperiments.createAssistants,
      { assistantIds, experimentId, projectId: args.projectId },
    );
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

export const createAssistants = internalMutation({
  args: {
    assistantIds: v.array(
      v.object({ assistantId: v.string(), personaId: v.id("personas") }),
    ),
    experimentId: v.id("experiments"),
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const tasks = args.assistantIds.map((ids) =>
      ctx.db.insert("assistants", {
        experimentId: args.experimentId,
        openaiAssistantId: ids.assistantId,
        personaId: ids.personaId,
        projectId: args.projectId,
      }),
    );
    return await Promise.all(tasks);
  },
});

export const createOpenaiAssistants = internalAction({
  args: {
    experiment: v.object({ _id: v.id("experiments"), name: v.string() }),
    personas: v.array(doc(schema, "personas")),
    project: doc(schema, "projects"),
  },
  handler: async (ctx, args) => {
    const tasks = args.personas.map(async (persona) => {
      const assistant = await ctx.openai.beta.assistants.create({
        description: templateAssistantDescription(
          persona,
          args.project,
          args.experiment,
        ),
        instructions: templateAssistantInstructions(
          persona,
          args.project,
          args.experiment,
        ),
        model,
        name: templateAssistantName(persona, args.project, args.experiment),
      });
      return { assistantId: assistant.id, personaId: persona._id };
    });
    return await Promise.all(tasks);
  },
});
