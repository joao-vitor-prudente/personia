import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "@server/api";
import { type Id } from "@server/dataModel";
import { useMutation } from "@tanstack/react-query";
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
        fromExperiment: typeof api.experiments.getExperiment._returnType;
        projectId?: undefined;
      }
    | { fromExperiment?: undefined; projectId: Id<"projects"> }
  ),
) {
  const createExperiment = useMutation({
    mutationFn: useConvexMutation(api.experiments.createExperiment),
    onError: (error) => toast.error(error.message),
    onSuccess: async (
      id: typeof api.experiments.createExperiment._returnType,
    ) => {
      await props.onCreate(id);
    },
  });

  const form = useExperimentForm({
    defaultValues: props.fromExperiment
      ? {
          name: props.fromExperiment.name,
          personas: props.fromExperiment.personas.map((p) => p._id),
          projectId: props.fromExperiment.projectId,
        }
      : undefined,
    projectId: props.projectId ?? props.fromExperiment.projectId,
    submit: async (value) => {
      await createExperiment.mutateAsync(value);
    },
  });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create new experiment</DialogTitle>
        <DialogDescription>
          Chose a name and a set of personas for your experiment
        </DialogDescription>
      </DialogHeader>
      <ExperimentForm form={form} />
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button onClick={() => void form.handleSubmit()}>Create</Button>
      </DialogFooter>
    </DialogContent>
  );
}