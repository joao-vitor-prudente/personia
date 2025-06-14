import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@server/api";
import { type Id } from "@server/dataModel";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";

import {
  ProjectForm,
  useProjectForm,
} from "@/components/projects/project-form.tsx";
import { Button } from "@/components/ui/button.tsx";
import { TypographyH4 } from "@/components/ui/typography.tsx";

export const Route = createFileRoute("/_authenticated/projects/create")({
  component: RouteComponent,
  validateSearch: z.object({ from: z.string().optional() }),
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const from = Route.useSearch().from as Id<"projects">;
  const fromProject = useQuery({
    ...convexQuery(api.functions.projects.getProject, { id: from }),
    enabled: !!from,
    select: ({ _creationTime, _id, organizationId: _, ...data }) => data,
  });

  const mutation = useMutation({
    mutationFn: useConvexMutation(api.functions.projects.createProject),
    onError: (error) => toast.error(error.message),
    onSuccess: (
      data: typeof api.functions.projects.createProject._returnType,
    ) => navigate({ params: { id: data }, to: "/projects/$id" }),
  });
  const form = useProjectForm({
    defaultValues: fromProject.data,
    submit: async (value) => {
      await mutation.mutateAsync(value);
    },
  });

  return (
    <main className="px-8 py-4 flex flex-col gap-8">
      <header className="w-full grid grid-cols-[1fr_auto_auto] gap-4">
        <TypographyH4>Create Project</TypographyH4>
        <Button asChild variant="secondary">
          <Link to="..">Return</Link>
        </Button>
        <Button onClick={() => void form.handleSubmit()}>Create</Button>
      </header>
      <ProjectForm form={form} />
    </main>
  );
}
