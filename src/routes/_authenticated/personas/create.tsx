import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@server/api";
import { type Id } from "@server/dataModel";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";

import {
  PersonaForm,
  usePersonaForm,
} from "@/components/personas/persona-form.tsx";
import { Button } from "@/components/ui/button.tsx";
import { TypographyH4 } from "@/components/ui/typography.tsx";

export const Route = createFileRoute("/_authenticated/personas/create")({
  component: RouteComponent,
  validateSearch: z.object({ from: z.string().optional() }),
});

function RouteComponent() {
  const from = Route.useSearch().from as Id<"personas">;
  const fromPersona = useQuery({
    ...convexQuery(api.functions.personas.getPersona, { id: from }),
    enabled: !!from,
    select: ({ _creationTime, _id, organizationId: _, ...data }) => data,
  });

  const navigate = Route.useNavigate();
  const createPersona = useMutation({
    mutationFn: useConvexMutation(api.functions.personas.createPersona),
    onError: (error) => toast.error(error.message),
    onSuccess: (
      data: typeof api.functions.personas.createPersona._returnType,
    ) => navigate({ params: { id: data }, to: "/personas/$id" }),
  });
  const form = usePersonaForm({
    defaultValues: fromPersona.data,
    submit: async (value) => {
      await createPersona.mutateAsync(value);
    },
  });

  return (
    <main className="px-8 py-4 flex flex-col gap-8">
      <header className="w-full grid grid-cols-[1fr_auto_auto] gap-4">
        <TypographyH4>Create Persona</TypographyH4>
        <Button asChild variant="secondary">
          <Link to="..">Return</Link>
        </Button>
        <Button onClick={() => void form.handleSubmit()}>Create</Button>
      </header>
      <PersonaForm form={form} />
    </main>
  );
}
