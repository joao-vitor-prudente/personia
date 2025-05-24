import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

import { query } from "./_generated/server";
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

    return await ctx.db
      .query("messages")
      .withIndex("experimentId", (q) => q.eq("experimentId", args.experimentId))
      .paginate(args.paginationOpts);
  },
});