import type { Id } from "@server/dataModel";

import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@server/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Copy, Info, Pencil, Plus, Target, Trash, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { CreateExperimentDialog } from "@/components/experiments/create-experiment-dialog.tsx";
import { ExperimentCard } from "@/components/experiments/experiment-card.tsx";
import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog.tsx";
import { Accordion } from "@/components/ui/accordion.tsx";
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
    convexQuery(api.functions.projects.getProject, { id: projectId }),
  );
  const experiments = useQuery(
    convexQuery(api.functions.experiments.listProjectExperiments, {
      projectId,
    }),
  );

  const deleteProject = useMutation({
    mutationFn: useConvexMutation(api.functions.projects.deleteProject),
    onError: (error) => toast.error(error.message),
    onSuccess: () => navigate({ to: "/projects" }),
  });

  const [accordionValue, setAccordionValue] = useState<string | undefined>();

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
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus />
                    Create new experiment
                  </Button>
                </DialogTrigger>
                <CreateExperimentDialog projectId={projectId} />
              </Dialog>
            </li>
          </ul>
        </nav>
      </header>
      <section className="space-y-8 col-span-2">
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
      <section className="space-y-4 col-span-2">
        <TypographyH4>Experiments</TypographyH4>
        <Accordion
          className="space-y-2"
          collapsible
          onValueChange={setAccordionValue}
          type="single"
          value={accordionValue}
        >
          {experiments.data?.map((experiment) => (
            <ExperimentCard
              accordionValue={accordionValue}
              experiment={experiment}
              key={experiment._id}
              projectName={project.data.name}
            />
          ))}
        </Accordion>
      </section>
    </main>
  );
}
