import { convexQuery } from "@convex-dev/react-query";
import { api } from "@server/api";
import { type Id } from "@server/dataModel";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { useAppForm } from "@/components/ui/form.tsx";
import { z2 } from "@/lib/zod-extensions.ts";

const formSchema = z.object({
  name: z.string(),
  personaIds: z.array(z2.id("personas")),
  projectId: z2.id("projects"),
});

type FormData = z.infer<typeof formSchema>;

export function ExperimentForm(props: {
  form: ReturnType<typeof useExperimentForm>;
}) {
  const personas = useQuery({
    ...convexQuery(api.personas.listPersonas, { search: "", sorting: "asc" }),
    select: (data) =>
      data.map((persona) => ({
        label: persona.name,
        value: persona._id,
      })),
  });

  return (
    <props.form.AppForm>
      <form className="space-y-4">
        <props.form.AppField name="name">
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
        </props.form.AppField>
        <props.form.AppField name="personaIds">
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
        </props.form.AppField>
      </form>
    </props.form.AppForm>
  );
}

export function useExperimentForm(props: {
  defaultValues?: FormData;
  projectId: Id<"projects">;
  submit: (value: FormData) => Promise<void>;
}) {
  const defaultValues: FormData = {
    name: "",
    personaIds: [],
    projectId: props.projectId,
  };
  return useAppForm({
    defaultValues: props.defaultValues ?? defaultValues,
    onSubmit: async ({ value }) => {
      await props.submit(value);
    },
    validators: { onChange: formSchema },
  });
}
