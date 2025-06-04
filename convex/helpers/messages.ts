import { ConvexError } from "convex/values";

import { type Doc } from "../_generated/dataModel";

export function hasPendingReplies(message: Doc<"messages">) {
  return message.replies.some((reply) => reply.status === "pending");
}
export function matchPersonasWithMessageReplies(
  message: Doc<"messages">,
  personas: Doc<"personas">[],
) {
  return personas.map((persona) => {
    const reply = message.replies.find((r) => r.authorId === persona._id);
    if (reply?.status === "finished") return { persona, reply };
    throw new ConvexError("This shouldn't happen");
  });
}