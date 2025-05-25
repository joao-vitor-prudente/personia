import { getAllOrThrow } from "convex-helpers/server/relationships";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

import { mutation, query } from "./context";

export const listMessages = query({
  args: {
    experimentId: v.id("experiments"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const experiment = await ctx.db.get(args.experimentId);
    if (!experiment) throw new Error("Experiment not found");
    if (experiment.organizationId !== ctx.identity.organization.id)
      throw new Error("User is not authorized to view this experiment");

    const personas = await getAllOrThrow(ctx.db, experiment.personaIds);

    const messages = await ctx.db
      .query("messages")
      .withIndex("experimentId", (q) => q.eq("experimentId", args.experimentId))
      .order("desc")
      .paginate(args.paginationOpts);

    const page = messages.page.map((message) => ({
      ...message,
      replies: message.replies.map((reply) => ({
        ...reply,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        author: personas.find((p) => p._id === reply.authorId)!,
      })),
    }));
    return { ...messages, page };
  },
});

export const sendMessage = mutation({
  args: {
    content: v.string(),
    experimentId: v.id("experiments"),
  },
  handler: async (ctx, args) => {
    const experiment = await ctx.db.get(args.experimentId);
    if (!experiment) throw new Error("Experiment not found");
    if (experiment.organizationId !== ctx.identity.organization.id)
      throw new Error("User is not authorized to view this experiment");
    await ctx.db.insert("messages", {
      author: ctx.identity.email,
      content: args.content,
      experimentId: args.experimentId,
      replies: experiment.personaIds.map((p) => ({
        authorId: p,
        status: "pending" as const,
      })),
    });
  },
});