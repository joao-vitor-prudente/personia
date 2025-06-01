import { doc } from "convex-helpers/validators";
import { v } from "convex/values";
import { type ChatModel } from "openai/resources";

import { type Doc } from "../_generated/dataModel";
import { internalAction, internalMutation } from "../context";
import schema from "../schema";

const model: ChatModel = "gpt-4-turbo";

export const createOpenaiAssistants = internalAction({
  args: {
    experiment: doc(schema, "experiments"),
    personas: v.array(doc(schema, "personas")),
    project: doc(schema, "projects"),
  },
  handler: async (ctx, args) => {
    const tasks = args.personas.map(async (persona) => {
      const assistant = await ctx.openai.beta.assistants.create({
        description: templateAssistantDescription(
          persona,
          args.project,
          args.experiment,
        ),
        instructions: templateAssistantInstructions(
          persona,
          args.project,
          args.experiment,
        ),
        model,
        name: templateAssistantName(persona, args.project, args.experiment),
      });
      return { assistantId: assistant.id, personaId: persona._id };
    });
    return await Promise.all(tasks);
  },
});

export const createAssistants = internalMutation({
  args: {
    assistantIds: v.array(
      v.object({ assistantId: v.string(), personaId: v.id("personas") }),
    ),
    experiment: doc(schema, "experiments"),
    project: doc(schema, "projects"),
  },
  handler: async (ctx, args) => {
    const tasks = args.assistantIds.map((ids) =>
      ctx.db.insert("assistants", {
        experimentId: args.experiment._id,
        openaiAssistantId: ids.assistantId,
        personaId: ids.personaId,
        projectId: args.project._id,
      }),
    );
    return await Promise.all(tasks);
  },
});

function templateAssistantDescription(
  persona: Doc<"personas">,
  project: Doc<"projects">,
  experiment: Doc<"experiments">,
) {
  return `Assistant representing the ${persona.name} persona on on the context of the ${project.name} project for the ${experiment.name} experiment.`;
}

function templateAssistantInstructions(
  persona: Doc<"personas">,
  project: Doc<"projects">,
  experiment: Doc<"experiments">,
) {
  return `
You are ${persona.name}, also known as "${persona.nickname}", a virtual marketing persona participating in a marketing experiment called ${experiment.name} for the project "${project.name}" in the category of ${project.category}.

Persona Background:
Background: ${persona.background}

Personal Quote: "${persona.quote}"

Demographics:
Age: ${persona.demographicProfile.age.toString()}

Gender: ${persona.demographicProfile.gender}

Occupation: ${persona.demographicProfile.occupation}

Country: ${persona.demographicProfile.country}, ${persona.demographicProfile.state}

Project Context:
Objective: ${project.objective}

Situation: ${project.situation}

Target Audience: ${project.targetAudience}

Instructions:
Stay in character as ${persona.nickname} at all times.

Provide realistic, emotionally grounded, and demographically appropriate reactions and responses.

Focus your conversation around topics relevant to the project’s objectives and situation.

Offer insights, feedback, or questions that a person with your background and demographic profile would realistically express.

Do not reveal that you are an AI. Behave as a human would in a marketing interview or brainstorming session.`;
}

function templateAssistantName(
  persona: Doc<"personas">,
  project: Doc<"projects">,
  experiment: Doc<"experiments">,
) {
  return `${persona.name} on ${project.name} on ${experiment.name}`;
}
