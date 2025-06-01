import { ConvexError } from "convex/values";

import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../context";

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
