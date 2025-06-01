import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "@server/api";
import { type Doc, type Id } from "@server/dataModel";
import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";
import { toast } from "sonner";

import {
  ExperimentForm,
  useExperimentForm,
} from "@/components/experiments/experiment-form.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";

export function CreateExperimentDialog(
  props: {
    onCreate: (id: Id<"experiments">) => Promise<void>;
  } & (
    | {
        fromExperiment: Doc<"experiments">;
        projectId?: undefined;
      }
    | { fromExperiment?: undefined; projectId: Id<"projects"> }
  ),
) {
  const createExperiment = useMutation({
    mutationFn: useConvexMutation(api.functions.experiments.createExperiment),
    onError: (error) => toast.error(error.message),
    onSuccess: async (
      id: typeof api.functions.experiments.createExperiment._returnType,
    ) => {
      await props.onCreate(id);
    },
  });

  const form = useExperimentForm({
    defaultValues: props.fromExperiment
      ? {
          name: props.fromExperiment.name,
          personaIds: props.fromExperiment.personaIds,
          projectId: props.fromExperiment.projectId,
        }
      : undefined,
    projectId: props.projectId ?? props.fromExperiment.projectId,
    submit: async (value) => {
      await createExperiment.mutateAsync(value);
    },
  });

  const formRef = useRef<HTMLFormElement>(null);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create new experiment</DialogTitle>
        <DialogDescription>
          Chose a name and a set of personas for your experiment
        </DialogDescription>
      </DialogHeader>
      <ExperimentForm form={form} ref={formRef} />
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button onClick={() => formRef.current?.requestSubmit()}>Create</Button>
      </DialogFooter>
    </DialogContent>
  );
}
