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
  hasPendingReplies,
  matchPersonasWithMessageReplies,
} from "../helpers/messages";
import { model, templateInstructionPrompt } from "../helpers/prompts";
import { workflow } from "../index";
import schema from "../schema";

export const sendMessage = mutation({
  args: {
    content: v.string(),
    experimentId: v.id("experiments"),
  },
  handler: async (ctx, args) => {
    const user = {
      email: ctx.identity.email,
      organizationId: ctx.identity.organization.id,
    };
    await workflow.start(
      ctx,
      internal.workflows.sendMessage.sendMessageWorkflow,
      { ...args, user },
    );
  },
});

export const sendMessageWorkflow = workflow.define({
  args: {
    content: v.string(),
    experimentId: v.id("experiments"),
    user: v.object({ email: v.string(), organizationId: v.string() }),
  },
  handler: async (step, args) => {
    const experiment = await step.runQuery(
      internal.workflows.sendMessage.getExperiment,
      { experimentId: args.experimentId, user: args.user },
    );

    const [project, lastMessage, personas] = await Promise.all([
      step.runQuery(internal.workflows.sendMessage.getProject, {
        projectId: experiment.projectId,
      }),
      step.runQuery(internal.workflows.sendMessage.getLastMessage, {
        experimentId: experiment._id,
      }),
      step.runQuery(internal.workflows.sendMessage.getPersonas, {
        personaIds: experiment.personaIds,
      }),
    ]);

    if (lastMessage !== null && hasPendingReplies(lastMessage))
      throw new ConvexError("There are pending replies in the thread");

    const message = await step.runMutation(
      internal.workflows.sendMessage.createMessage,
      { content: args.content, experiment, user: args.user },
    );

    if (lastMessage === null) {
      const tasks = personas.map(async (persona) => {
        const response = await step.runAction(
          internal.workflows.sendMessage.sendOpenaiInitialMessage,
          { content: args.content, experiment, persona, project },
        );
        await step.runMutation(
          internal.workflows.sendMessage.updateReplyStatus,
          { message, personaId: persona._id, response },
        );
      });
      await Promise.all(tasks);
      return;
    }

    const tasks = matchPersonasWithMessageReplies(message, personas).map(
      async ({ persona, reply }) => {
        const response = await step.runAction(
          internal.workflows.sendMessage.sendOpenaiMessage,
          { content: args.content, previousResponseId: reply.openaiReplyId },
        );
        await step.runMutation(
          internal.workflows.sendMessage.updateReplyStatus,
          { message, personaId: persona._id, response },
        );
      },
    );
    await Promise.all(tasks);
  },
});

export const getExperiment = internalQuery({
  args: {
    experimentId: v.id("experiments"),
    user: v.object({ email: v.string(), organizationId: v.string() }),
  },
  handler: async (ctx, args) => {
    console.log("getting experiment");
    const experiment = await ctx.db.get(args.experimentId);
    if (!experiment) throw new ConvexError("Experiment not found");
    if (experiment.organizationId !== args.user.organizationId)
      throw new ConvexError("User is not authorized to view this experiment");
    console.log("experiment: ", experiment);
    return experiment;
  },
});

export const getProject = internalQuery({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    console.log("getting project");
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new ConvexError("Project not found");
    console.log("project: ", project);
    return project;
  },
});

export const getPersonas = internalQuery({
  args: { personaIds: v.array(v.id("personas")) },
  handler: async (ctx, args) => {
    return getAllOrThrow(ctx.db, args.personaIds);
  },
});

export const getLastMessage = internalQuery({
  args: {
    experimentId: v.id("experiments"),
  },
  handler: async (ctx, args) => {
    console.log("getting last message");
    const lastMessage = await ctx.db
      .query("messages")
      .withIndex("experimentId", (q) => q.eq("experimentId", args.experimentId))
      .order("desc")
      .first();
    console.log("last message: ", lastMessage ?? "null");
    return lastMessage;
  },
});

export const createMessage = internalMutation({
  args: {
    content: v.string(),
    experiment: doc(schema, "experiments"),
    user: v.object({ email: v.string(), organizationId: v.string() }),
  },
  handler: async (ctx, args) => {
    console.log("creating message");
    const messageId = await ctx.db.insert("messages", {
      author: args.user.email,
      content: args.content,
      experimentId: args.experiment._id,
      replies: args.experiment.personaIds.map((id) => ({
        authorId: id,
        status: "pending" as const,
      })),
    });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const createdMessage = (await ctx.db.get(messageId))!;
    console.log("created message: ", createdMessage);
    return createdMessage;
  },
});

export const sendOpenaiMessage = internalAction({
  args: {
    content: v.string(),
    previousResponseId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("getting openai reply");
    const reply = await ctx.openai.responses.create({
      input: args.content,
      model,
      previous_response_id: args.previousResponseId,
    });
    console.log("openai reply: ", reply);
    return reply;
  },
});

export const sendOpenaiInitialMessage = internalAction({
  args: {
    content: v.string(),
    experiment: doc(schema, "experiments"),
    persona: doc(schema, "personas"),
    project: doc(schema, "projects"),
  },
  handler: async (ctx, args) => {
    console.log("getting openai initial reply");
    const reply = await ctx.openai.responses.create({
      input: args.content,
      instructions: templateInstructionPrompt(args),
      model,
    });
    console.log("oepnai initial reply: ", reply);
    return reply;
  },
});

export const updateReplyStatus = internalMutation({
  args: {
    message: doc(schema, "messages"),
    personaId: v.id("personas"),
    response: v.object({ id: v.string(), output_text: v.string() }),
  },
  handler: async (ctx, args) => {
    console.log("updating reply status");
    await ctx.db.patch(args.message._id, {
      replies: args.message.replies.map((reply) => {
        if (reply.authorId !== args.personaId) return reply;
        return {
          authorId: reply.authorId,
          content: args.response.output_text,
          finishedAt: Date.now(),
          openaiReplyId: args.response.id,
          status: "finished" as const,
        };
      }),
    });
    const message = await ctx.db.get(args.message._id);
    console.log("updated message: ", message);
    return message;
  },
});