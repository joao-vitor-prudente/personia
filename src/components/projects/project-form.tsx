import { z } from "zod";

import { useAppForm } from "@/components/ui/form.tsx";

const formSchema = z.object({
  category: z.string(),
  name: z.string(),
  objective: z.string(),
  situation: z.string(),
  targetAudience: z.string(),
});

type FormData = z.infer<typeof formSchema>;

const defaultValues: FormData = {
  category: "",
  name: "",
  objective: "",
  situation: "",
  targetAudience: "",
};

type Form = ReturnType<typeof useProjectForm>;

export function ProjectForm(props: { form: Form }) {
  return (
    <props.form.AppForm>
      <form className="grid grid-cols-[1fr_2fr] gap-x-48 gap-y-24">
        <fieldset className="space-y-4">
          <props.form.AppField name="name">
            {(field) => (
              <field.FormItem>
                <field.FormLabel>Name</field.FormLabel>
                <field.FormControl>
                  <field.Input autoComplete="off" />
                </field.FormControl>
                <field.FormDescription>
                  This is your project's name.
                </field.FormDescription>
                <field.FormMessage />
              </field.FormItem>
            )}
          </props.form.AppField>
          <props.form.AppField name="category">
            {(field) => (
              <field.FormItem>
                <field.FormLabel>Category</field.FormLabel>
                <field.FormControl>
                  <field.Input />
                </field.FormControl>
                <field.FormDescription>
                  This is the market category your project is focused on.
                </field.FormDescription>
                <field.FormMessage />
              </field.FormItem>
            )}
          </props.form.AppField>
        </fieldset>
        <fieldset className="space-y-4">
          <props.form.AppField name="objective">
            {(field) => (
              <field.FormItem>
                <field.FormLabel>Objective</field.FormLabel>
                <field.FormControl>
                  <field.Textarea />
                </field.FormControl>
                <field.FormDescription>
                  This is your project's objective.
                </field.FormDescription>
                <field.FormMessage />
              </field.FormItem>
            )}
          </props.form.AppField>
          <props.form.AppField name="situation">
            {(field) => (
              <field.FormItem>
                <field.FormLabel>Situation</field.FormLabel>
                <field.FormControl>
                  <field.Textarea />
                </field.FormControl>
                <field.FormDescription>
                  This is your project's situation.
                </field.FormDescription>
                <field.FormMessage />
              </field.FormItem>
            )}
          </props.form.AppField>
          <props.form.AppField name="targetAudience">
            {(field) => (
              <field.FormItem>
                <field.FormLabel>Target Audience</field.FormLabel>
                <field.FormControl>
                  <field.Textarea />
                </field.FormControl>
                <field.FormDescription>
                  This is your project's target audience.
                </field.FormDescription>
                <field.FormMessage />
              </field.FormItem>
            )}
          </props.form.AppField>
        </fieldset>
      </form>
    </props.form.AppForm>
  );
}

export function useProjectForm(props: {
  defaultValues?: FormData;
  submit: (value: FormData) => Promise<void>;
}) {
  return useAppForm({
    defaultValues: props.defaultValues ?? defaultValues,
    onSubmit: async ({ value }) => {
      await props.submit(value);
    },
    validators: { onChange: formSchema },
  });
}
