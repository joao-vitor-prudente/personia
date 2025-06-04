import { getAllOrThrow } from "convex-helpers/server/relationships";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

import { query } from "../context";
import { getExperimentHelper } from "../helpers/experiments";

export const listMessages = query({
  args: {
    experimentId: v.id("experiments"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const experiment = await getExperimentHelper(ctx, args.experimentId);

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
