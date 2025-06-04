import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "@server/api";
import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ClipboardList,
  Clock,
  Copy,
  EllipsisVertical,
  Pencil,
  Trash,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { CreateExperimentDialog } from "@/components/experiments/create-experiment-dialog.tsx";
import { DeleteExperimentDialog } from "@/components/experiments/delete-experiment-dialog.tsx";
import { EditExperimentDialog } from "@/components/experiments/edit-experiment-dialog.tsx";
import { ExperimentPersonaCard } from "@/components/personas/experiment-persona-card.tsx";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion.tsx";
import { Dialog, DialogTrigger } from "@/components/ui/dialog.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { TypographyH5, TypographyMuted } from "@/components/ui/typography.tsx";
import { dateFormatter } from "@/lib/date.ts";

export function ExperimentCard(props: {
  accordionValue: string | undefined;
  experiment: (typeof api.functions.experiments.listProjectExperiments._returnType)[number];
  projectName: string;
}) {
  const deleteExperiment = useMutation({
    mutationFn: useConvexMutation(api.functions.experiments.deleteExperiment),
    onError: (error) => toast.error(error.message),
  });

  return (
    <AccordionItem className="space-y-4 pt-2" value={props.experiment._id}>
      <section className="bg-card text-card-foreground grid grid-cols-[repeat(4,_1fr)_auto] items-center rounded-xl border p-6 shadow-sm">
        <div>
          <Link
            className="underline-offset-4"
            params={{ id: props.experiment._id }}
            to="/experiments/$id"
          >
            <TypographyH5>{props.experiment.name}</TypographyH5>
          </Link>
        </div>
        <TypographyMuted className="flex gap-2">
          <User />
          <span>{props.experiment.owner}</span>
        </TypographyMuted>
        <TypographyMuted className="flex gap-2">
          <Clock />
          <span>{dateFormatter.format(props.experiment._creationTime)}</span>
        </TypographyMuted>
        <TypographyMuted className="flex gap-2">
          <ClipboardList />
          <span>{props.projectName}</span>
        </TypographyMuted>
        <div className="flex gap-2">
          <AccordionTrigger chevronClassName="size-8" className="p-0" />
          <DropdownMenu>
            <DropdownMenuTrigger>
              <TypographyMuted>
                <EllipsisVertical />
              </TypographyMuted>
            </DropdownMenuTrigger>
            <DropdownMenuPortal>
              <DropdownMenuContent>
                <DropdownMenuLabel>Experiment Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Dialog>
                  <DialogTrigger asChild>
                    <DropdownMenuItem preventDefault>
                      <Pencil />
                      <span>Edit</span>
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <EditExperimentDialog experiment={props.experiment} />
                </Dialog>
                <Dialog>
                  <DialogTrigger asChild>
                    <DropdownMenuItem preventDefault>
                      <Copy />
                      <span>Copy</span>
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <CreateExperimentDialog fromExperiment={props.experiment} />
                </Dialog>
                <Dialog>
                  <DialogTrigger asChild>
                    <DropdownMenuItem preventDefault>
                      <Trash />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DeleteExperimentDialog
                    deleteExperiment={() => {
                      deleteExperiment.mutate({ id: props.experiment._id });
                    }}
                    name={props.experiment.name}
                  />
                </Dialog>
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenu>
        </div>
      </section>

      <AccordionContent>
        <section className="bg-card text-card-foreground rounded-xl border p-6 space-y-6 shadow-sm">
          <TypographyH5>
            <span>{props.experiment.name}</span>
            <span> Personas</span>
          </TypographyH5>
          <ul className="space-y-4">
            {props.experiment.personas.map((persona) => (
              <li key={persona._id}>
                <ExperimentPersonaCard persona={persona} />
              </li>
            ))}
          </ul>
        </section>
      </AccordionContent>
    </AccordionItem>
  );
}
