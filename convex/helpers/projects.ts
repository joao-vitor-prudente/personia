import { ConvexError } from "convex/values";

import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../context";

export async function getProjectHelper(
  ctx: MutationCtx | QueryCtx,
  id: Id<"projects">,
) {
  const project = await ctx.db.get(id);
  if (!project) throw new ConvexError("Project not found");
  if (project.organizationId !== ctx.identity.organization.id)
    throw new ConvexError("User is not authorized to view this project");
  return project;
}
