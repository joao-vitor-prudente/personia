import type { Id } from "@server/dataModel";

import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@server/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Copy, Pencil, Trash } from "lucide-react";
import { toast } from "sonner";

import { CreateExperimentDialog } from "@/components/experiments/create-experiment-dialog.tsx";
import { DeleteExperimentDialog } from "@/components/experiments/delete-experiment-dialog.tsx";
import { EditExperimentDialog } from "@/components/experiments/edit-experiment-dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Dialog, DialogTrigger } from "@/components/ui/dialog.tsx";
import { TypographyH4 } from "@/components/ui/typography.tsx";

export const Route = createFileRoute("/_authenticated/experiments/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const experimentId = Route.useParams().id as Id<"experiments">;
  const navigate = Route.useNavigate();
  const experiment = useQuery(
    convexQuery(api.experiments.getExperiment, { id: experimentId }),
  );

  const deleteExperiment = useMutation({
    mutationFn: useConvexMutation(api.experiments.deleteExperiment),
    onError: (error) => toast.error(error.message),
    onSuccess: () =>
      navigate({
        params: { id: experiment.data?.projectId },
        to: "/projects/$id",
      }),
  });
  if (!experiment.data) return null;

  const experimentWithoutPersonas = {
    ...experiment.data,
    personas: experiment.data.personas.map((p) => p._id),
  };

  return (
    <main className="py-4 px-8 grid grid-cols-[1fr_2fr] gap-x-48 gap-y-8">
      <header className="grid grid-cols-[1fr_auto] col-span-2">
        <TypographyH4>{experiment.data.name}</TypographyH4>
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
                <DeleteExperimentDialog
                  deleteExperiment={() => {
                    deleteExperiment.mutate({ id: experimentId });
                  }}
                  name={experiment.data.name}
                />
              </Dialog>
            </li>
            <li>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Copy />
                    Copy
                  </Button>
                </DialogTrigger>
                <CreateExperimentDialog
                  fromExperiment={experimentWithoutPersonas}
                  onCreate={(id) =>
                    navigate({ params: { id }, to: "/projects/$id" })
                  }
                />
              </Dialog>
            </li>
            <li>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Pencil />
                    Edit
                  </Button>
                </DialogTrigger>
                <EditExperimentDialog experiment={experimentWithoutPersonas} />
              </Dialog>
            </li>
          </ul>
        </nav>
      </header>
      <section>chat</section>
    </main>
  );
}
