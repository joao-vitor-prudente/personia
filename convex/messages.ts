import { getAllOrThrow } from "convex-helpers/server/relationships";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getIdentityOrThrow } from "./helpers";

export const listMessages = query({
  args: {
    experimentId: v.id("experiments"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const identity = await getIdentityOrThrow(ctx);
    const experiment = await ctx.db.get(args.experimentId);
    if (!experiment) throw new Error("Experiment not found");
    if (experiment.organizationId !== identity.organization.id)
      throw new Error("User is not authorized to view this experiment");

    const personas = await getAllOrThrow(ctx.db, experiment.personas);

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
        author: personas.find((p) => p._id === reply.author)!,
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
    const identity = await getIdentityOrThrow(ctx);
    const experiment = await ctx.db.get(args.experimentId);
    if (!experiment) throw new Error("Experiment not found");
    if (experiment.organizationId !== identity.organization.id)
      throw new Error("User is not authorized to view this experiment");
    await ctx.db.insert("messages", {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      author: identity.email!,
      content: args.content,
      experimentId: args.experimentId,
      replies: experiment.personas.map((p) => ({
        author: p,
        status: "pending" as const,
      })),
    });
  },
});