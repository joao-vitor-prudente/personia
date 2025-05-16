import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
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
});
