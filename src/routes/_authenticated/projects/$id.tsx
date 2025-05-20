import type { Id } from "@server/dataModel";

import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@server/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Copy, Info, Pencil, Plus, Target, Trash, Users } from "lucide-react";
import { toast } from "sonner";

import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Dialog, DialogTrigger } from "@/components/ui/dialog.tsx";
import {
  TypographyH4,
  TypographyMuted,
  TypographySmall,
} from "@/components/ui/typography.tsx";

export const Route = createFileRoute("/_authenticated/projects/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const projectId = Route.useParams().id as Id<"projects">;
  const project = useQuery(
    convexQuery(api.projects.getProject, { id: projectId }),
  );

  const deleteProject = useMutation({
    mutationFn: useConvexMutation(api.projects.deleteProject),
    onError: (error) => toast.error(error.message),
    onSuccess: () => navigate({ to: "/projects" }),
  });

  if (!project.data) return null;

  return (
    <main className="py-4 px-8 grid grid-cols-[1fr_2fr] gap-x-48 gap-y-8">
      <header className="grid grid-cols-[1fr_auto] col-span-2">
        <div>
          <TypographyH4>{project.data.name}</TypographyH4>
          <TypographyMuted>{project.data.category}</TypographyMuted>
        </div>
        <nav>
          <ul className="flex gap-2">
            <li>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Trash />
                    Delete
                  </Button>
                </DialogTrigger>
                <DeleteProjectDialog
                  deleteProject={() => {
                    deleteProject.mutate({ id: projectId });
                  }}
                  name={project.data.name}
                />
              </Dialog>
            </li>
            <li>
              <Button asChild variant="outline">
                <Link search={{ from: projectId }} to="/projects/create">
                  <Copy />
                  Copy
                </Link>
              </Button>
            </li>
            <li>
              <Button asChild variant="outline">
                <Link params={{ id: projectId }} to="/projects/edit/$id">
                  <Pencil />
                  Edit
                </Link>
              </Button>
            </li>
            <li>
              <Button>
                <Plus />
                Create new experiment
              </Button>
            </li>
          </ul>
        </nav>
      </header>
      <section className="space-y-8">
        <ul className="space-y-2">
          <li className="flex gap-1 items-center">
            <Target />
            <TypographySmall>{project.data.objective}</TypographySmall>
          </li>
          <li className="flex gap-1 items-center">
            <Info />
            <TypographySmall>{project.data.situation}</TypographySmall>
          </li>
          <li className="flex gap-1 items-center">
            <Users />
            <TypographySmall>{project.data.targetAudience}</TypographySmall>
          </li>
        </ul>
      </section>
    </main>
  );
}
