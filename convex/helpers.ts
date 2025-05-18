import type { ActionCtx, MutationCtx, QueryCtx } from "./_generated/server";

export async function getIdentityOrThrow(
  ctx: ActionCtx | MutationCtx | QueryCtx,
) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) throw new Error("User is not signed in");
  const [id, role] = Object.entries(identity.organizations)[0];
  return { ...identity, organization: { id, role } };
}
