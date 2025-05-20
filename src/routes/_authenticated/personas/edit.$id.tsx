import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@server/api";
import { type Id } from "@server/dataModel";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";

import {
  PersonaForm,
  usePersonaForm,
} from "@/components/personas/persona-form.tsx";
import { Button } from "@/components/ui/button.tsx";
import { TypographyH4 } from "@/components/ui/typography.tsx";

export const Route = createFileRoute("/_authenticated/personas/edit/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const personaId = Route.useParams().id as Id<"personas">;
  const fromPersona = useQuery({
    ...convexQuery(api.personas.getPersona, { id: personaId }),
    select: ({ _creationTime, _id, organizationId: _, ...data }) => data,
  });

  const navigate = Route.useNavigate();
  const editPersona = useMutation({
    mutationFn: useConvexMutation(api.personas.editPersona),
    onError: (error) => toast.error(error.message),
    onSuccess: () =>
      navigate({ params: { id: personaId }, to: "/personas/$id" }),
  });
  const form = usePersonaForm({
    defaultValues: fromPersona.data,
    submit: async (value) => {
      await editPersona.mutateAsync({ id: personaId, ...value });
    },
  });

  return (
    <main className="px-8 py-4 flex flex-col gap-8">
      <header className="w-full grid grid-cols-[1fr_auto_auto] gap-4">
        <TypographyH4>Edit Persona</TypographyH4>
        <Button asChild variant="secondary">
          <Link to="..">Return</Link>
        </Button>
        <Button onClick={() => void form.handleSubmit()}>Edit</Button>
      </header>
      <PersonaForm form={form} />
    </main>
  );
}
