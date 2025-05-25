import {
  customAction,
  customCtx,
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions";
import { ConvexError } from "convex/values";

import {
  type ActionCtx,
  action as baseAction,
  mutation as baseMutation,
  query as baseQuery,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";

export const query = customQuery(baseQuery, customCtx(getCustomCtx));

export const mutation = customMutation(baseMutation, customCtx(getCustomCtx));

export const action = customAction(baseAction, customCtx(getCustomCtx));

async function getCustomCtx(ctx: ActionCtx | MutationCtx | QueryCtx) {
  const identity = await requireAuth(ctx);
  return { ...ctx, identity };
}

async function requireAuth(ctx: ActionCtx | MutationCtx | QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) throw new ConvexError("User is not signed in");
  const [id, role] = Object.entries(identity.organizations)[0];
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return { ...identity, email: identity.email!, organization: { id, role } };
}