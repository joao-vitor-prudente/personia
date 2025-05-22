import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@server/api";
import { type Id } from "@server/dataModel";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button.tsx";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { useAppForm } from "@/components/ui/form.tsx";
import { z2 } from "@/lib/zod-extensions.ts";

const formSchema = z.object({
  name: z.string(),
  personas: z.array(z2.id("personas")),
  projectId: z2.id("projects"),
});

type FormData = z.infer<typeof formSchema>;

export function CreateExperimentDialog(props: {
  onCreate: (id: Id<"experiments">) => Promise<void>;
  projectId: Id<"projects">;
}) {
  const personas = useQuery({
    ...convexQuery(api.personas.listPersonas, { search: "", sorting: "asc" }),
    select: (data) =>
      data.map((persona) => ({
        label: persona.name,
        value: persona._id,
      })),
  });
  const createExperiment = useMutation({
    mutationFn: useConvexMutation(api.experiments.createExperiment),
    onError: (error) => toast.error(error.message),
    onSuccess: async (
      id: typeof api.experiments.createExperiment._returnType,
    ) => {
      await props.onCreate(id);
    },
  });
  
  const defaultValues: FormData = {
    name: "",
    personas: [],
    projectId: props.projectId,
  };
  const form = useAppForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await createExperiment.mutateAsync(value);
    },
    validators: { onChange: formSchema },
  });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create new experiment</DialogTitle>
        <DialogDescription>
          Chose a name and a set of personas for your experiment
        </DialogDescription>
      </DialogHeader>
      <form.AppForm>
        <form className="space-y-4">
          <form.AppField name="name">
            {(field) => (
              <field.FormItem>
                <field.FormLabel>Name</field.FormLabel>
                <field.FormControl>
                  <field.Input autoComplete="off" />
                </field.FormControl>
                <field.FormDescription>
                  This is your experiment's name.
                </field.FormDescription>
                <field.FormMessage />
              </field.FormItem>
            )}
          </form.AppField>
          <form.AppField name="personas">
            {(field) => (
              <field.FormItem>
                <field.FormLabel>Name</field.FormLabel>
                <field.FormControl>
                  <field.MultiSelect
                    options={personas.data ?? []}
                    placeholder="Select personas"
                  />
                </field.FormControl>
                <field.FormDescription>
                  Those are the personas you want to include in your experiment
                </field.FormDescription>
                <field.FormMessage />
              </field.FormItem>
            )}
          </form.AppField>
        </form>
      </form.AppForm>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button onClick={() => void form.handleSubmit()}>Create</Button>
      </DialogFooter>
    </DialogContent>
  );
}