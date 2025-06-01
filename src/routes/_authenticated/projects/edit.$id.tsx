import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@server/api";
import { type Id } from "@server/dataModel";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";

import {
  ProjectForm,
  useProjectForm,
} from "@/components/projects/project-form.tsx";
import { Button } from "@/components/ui/button.tsx";
import { TypographyH4 } from "@/components/ui/typography.tsx";

export const Route = createFileRoute("/_authenticated/projects/edit/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const projectId = Route.useParams().id as Id<"projects">;
  const project = useQuery({
    ...convexQuery(api.functions.projects.getProject, { id: projectId }),
    select: ({ _creationTime, _id, organizationId: _, ...data }) => data,
  });

  const navigate = Route.useNavigate();
  const editProject = useMutation({
    mutationFn: useConvexMutation(api.functions.projects.editProject),
    onError: (error) => toast.error(error.message),
    onSuccess: () =>
      navigate({ params: { id: projectId }, to: "/projects/$id" }),
  });

  const form = useProjectForm({
    defaultValues: project.data,
    submit: async (value) => {
      await editProject.mutateAsync({ id: projectId, ...value });
    },
  });

  return (
    <main className="px-8 py-4 flex flex-col gap-8">
      <header className="w-full grid grid-cols-[1fr_auto_auto] gap-4">
        <TypographyH4>Edit Project</TypographyH4>
        <Button asChild variant="secondary">
          <Link to="..">Return</Link>
        </Button>
        <Button onClick={() => void form.handleSubmit()}>Edit</Button>
      </header>
      <ProjectForm form={form} />
    </main>
  );
}
