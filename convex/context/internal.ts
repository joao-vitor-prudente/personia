import {
  customAction,
  customCtx,
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions";
import { OpenAI } from "openai";

import {
  type ActionCtx as BaseActionCtx,
  internalAction as baseInternalAction,
  internalMutation as baseInternalMutation,
  internalQuery as baseInternalQuery,
  type MutationCtx as BaseMutationCtx,
  type QueryCtx as BaseQueryCtx,
} from "../_generated/server";

export const internalQuery = customQuery(
  baseInternalQuery,
  customCtx(getCustomInternalCtx),
);

export const internalMutation = customMutation(
  baseInternalMutation,
  customCtx(getCustomInternalCtx),
);

export const internalAction = customAction(
  baseInternalAction,
  customCtx(getCustomInternalCtx),
);

export type InternalActionCtx = InternalContext<BaseActionCtx>;
export type InternalMutationCtx = InternalContext<BaseMutationCtx>;
export type InternalQueryCtx = InternalContext<BaseQueryCtx>;

type InternalContext<
  BaseCtx extends BaseActionCtx | BaseMutationCtx | BaseQueryCtx,
> = BaseCtx & { openai: OpenAI };

function getCustomInternalCtx<
  BaseCtx extends BaseActionCtx | BaseMutationCtx | BaseQueryCtx,
>(ctx: BaseCtx): InternalContext<BaseCtx> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  return { ...ctx, openai };
}
