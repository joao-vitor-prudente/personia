import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  experiments: defineTable({
    name: v.string(),
    organizationId: v.string(),
    owner: v.string(),
    personaIds: v.array(v.id("personas")),
    projectId: v.id("projects"),
  }).index("projectId", ["projectId"]),
  messages: defineTable({
    author: v.string(),
    content: v.string(),
    experimentId: v.id("experiments"),
    replies: v.array(
      v.union(
        v.object({
          authorId: v.id("personas"),
          content: v.string(),
          finishedAt: v.number(),
          openaiReplyId: v.string(),
          status: v.literal("finished"),
        }),
        v.object({
          authorId: v.id("personas"),
          status: v.literal("pending"),
        }),
      ),
    ),
  }).index("experimentId", ["experimentId"]),
  personas: defineTable({
    background: v.string(),
    demographicProfile: v.object({
      age: v.number(),
      country: v.string(),
      gender: v.union(v.literal("male"), v.literal("female")),
      occupation: v.string(),
      state: v.string(),
    }),
    name: v.string(),
    nickname: v.string(),
    organizationId: v.string(),
    quote: v.string(),
  }).index("organizationId", ["organizationId"]),
  projects: defineTable({
    category: v.string(),
    name: v.string(),
    objective: v.string(),
    organizationId: v.string(),
    situation: v.string(),
    targetAudience: v.string(),
  }).index("organizationId", ["organizationId"]),
});
