import { ConvexError } from "convex/values";

import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../context";

export async function getPersonaHelper(
  ctx: MutationCtx | QueryCtx,
  id: Id<"personas">,
) {
  const persona = await ctx.db.get(id);
  if (!persona) throw new ConvexError("Persona not found");
  if (persona.organizationId !== ctx.identity.organization.id)
    throw new ConvexError("User is not authorized to view this persona");
  return persona;
}
