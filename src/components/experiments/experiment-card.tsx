import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@server/api";
import { type Doc } from "@server/dataModel";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ClipboardList,
  Clock,
  Copy,
  EllipsisVertical,
  Loader,
  Pencil,
  Trash,
  User,
} from "lucide-react";
import { useState } from "react";
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
import { Dialog } from "@/components/ui/dialog.tsx";
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
  accordeonValue: string | undefined;
  experiment: Doc<"experiments">;
  projectName: string;
}) {
  const experiment = useQuery({
    ...convexQuery(api.experiments.getExperiment, {
      id: props.experiment._id,
    }),
    enabled: props.accordeonValue === props.experiment._id,
  });
  const navigate = useNavigate();
  const deleteExperiment = useMutation({
    mutationFn: useConvexMutation(api.experiments.deleteExperiment),
    onError: (error) => toast.error(error.message),
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  return (
    <>
      <AccordionItem className="space-y-4 pt-2" value={props.experiment._id}>
        <section className="bg-card text-card-foreground grid grid-cols-[repeat(4,_1fr)_auto] items-center rounded-xl border p-6 shadow-sm">
          <Link
            className="underline-offset-4 hover:underline"
            params={{ id: props.experiment._id }}
            to="/experiments/$id"
          >
            <TypographyH5>{props.experiment.name}</TypographyH5>
          </Link>
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
                  <DropdownMenuItem
                    onSelect={() => {
                      setEditDialogOpen(true);
                    }}
                  >
                    <Pencil />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      setCopyDialogOpen(true);
                    }}
                  >
                    <Copy />
                    <span>Copy</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash />
                    <span>Delete</span>
                  </DropdownMenuItem>
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
            {experiment.data ? (
              <ul className="space-y-4">
                {experiment.data.personas.map((persona) => (
                  <li key={persona._id}>
                    <ExperimentPersonaCard persona={persona} />
                  </li>
                ))}
              </ul>
            ) : (
              <Loader className="mx-auto animate-spin" />
            )}
          </section>
        </AccordionContent>
      </AccordionItem>
      <Dialog onOpenChange={setEditDialogOpen} open={editDialogOpen}>
        <EditExperimentDialog experiment={props.experiment} />
      </Dialog>
      <Dialog onOpenChange={setCopyDialogOpen} open={copyDialogOpen}>
        <CreateExperimentDialog
          fromExperiment={props.experiment}
          onCreate={(id) =>
            navigate({ params: { id }, to: "/experiments/$id" })
          }
        />
      </Dialog>
      <Dialog onOpenChange={setDeleteDialogOpen} open={deleteDialogOpen}>
        <DeleteExperimentDialog
          deleteExperiment={() => {
            deleteExperiment.mutate({ id: props.experiment._id });
          }}
          name={props.experiment.name}
        />
      </Dialog>
    </>
  );
}
