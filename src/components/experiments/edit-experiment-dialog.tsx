import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "@server/api";
import { type Doc } from "@server/dataModel";
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

export function EditExperimentDialog(props: {
  experiment: Doc<"experiments">;
}) {
  const editExperiment = useMutation({
    mutationFn: useConvexMutation(api.functions.experiments.editExperiment),
  });

  const form = useExperimentForm({
    defaultValues: {
      name: props.experiment.name,
      personaIds: props.experiment.personaIds,
      projectId: props.experiment.projectId,
    },
    projectId: props.experiment.projectId,
    submit: async ({ projectId: _, ...value }) => {
      const promise = editExperiment.mutateAsync({
        ...value,
        id: props.experiment._id,
      });
      toast.promise(promise, {
        error: (error: Error) => error.message,
        loading: "Editing experiment...",
        success: "Experiment edited!",
      });
      await promise;
    },
  });

  const formRef = useRef<HTMLFormElement>(null);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit experiment</DialogTitle>
        <DialogDescription>
          Chose a new name and a new set of personas for your experiment
        </DialogDescription>
      </DialogHeader>
      <ExperimentForm form={form} ref={formRef} />
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <DialogClose asChild>
          <Button onClick={() => formRef.current?.requestSubmit()}>Edit</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
