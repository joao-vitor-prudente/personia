import {
  customAction,
  customCtx,
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions";
import { ConvexError } from "convex/values";
import { OpenAI } from "openai";

import {
  action as baseAction,
  type ActionCtx as BaseActionCtx,
  mutation as baseMutation,
  type MutationCtx as BaseMutationCtx,
  query as baseQuery,
  type QueryCtx as BaseQueryCtx,
} from "../_generated/server";

export const query = customQuery(baseQuery, customCtx(getCustomCtx));

export const mutation = customMutation(baseMutation, customCtx(getCustomCtx));

export const action = customAction(baseAction, customCtx(getCustomCtx));

export type ActionCtx = Context<BaseActionCtx>;
export type MutationCtx = Context<BaseMutationCtx>;
export type QueryCtx = Context<BaseQueryCtx>;

type Context<BaseCtx extends BaseActionCtx | BaseMutationCtx | BaseQueryCtx> =
  BaseCtx & {
    identity: Awaited<ReturnType<typeof requireAuth>>;
    openai: OpenAI;
  };

async function getCustomCtx<
  BaseCtx extends BaseActionCtx | BaseMutationCtx | BaseQueryCtx,
>(ctx: BaseCtx): Promise<Context<BaseCtx>> {
  const identity = await requireAuth(ctx);
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  return { ...ctx, identity, openai };
}

async function requireAuth(
  ctx: BaseActionCtx | BaseMutationCtx | BaseQueryCtx,
) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) throw new ConvexError("User is not signed in");
  const [id, role] = Object.entries(identity.organizations)[0];
  if (identity.email === undefined)
    throw new ConvexError("User does not have an email");
  return { ...identity, email: identity.email, organization: { id, role } };
}
