import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "@server/api";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useId } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button.tsx";
import { useAppForm } from "@/components/ui/form.tsx";
import { TypographyH4 } from "@/components/ui/typography.tsx";

export const Route = createFileRoute("/_authenticated/projects/create")({
  component: RouteComponent,
});

const formSchema = z.object({
  category: z.string(),
  name: z.string(),
  objective: z.string(),
  situation: z.string(),
  targetAudience: z.string(),
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const mutation = useMutation({
    mutationFn: useConvexMutation(api.projects.createProject),
    onError: (error) => toast.error(error.message),
    onSuccess: (data: typeof api.projects.createProject._returnType) =>
      navigate({ params: { id: data }, to: "/projects/$id" }),
  });
  const form = useAppForm({
    defaultValues: {
      category: "",
      name: "",
      objective: "",
      situation: "",
      targetAudience: "",
    } as z.infer<typeof formSchema>,
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    },
    validators: { onChange: formSchema },
  });

  const nameFieldId = useId();
  const categoryFieldId = useId();
  const objectiveFieldId = useId();
  const situationFieldId = useId();
  const targetAudienceFieldId = useId();

  return (
    <main className="px-8 py-4 flex flex-col gap-8">
      <header className="w-full grid grid-cols-[1fr_auto_auto] gap-4">
        <TypographyH4>Create Project</TypographyH4>
        <Button asChild variant="secondary">
          <Link to="..">Return</Link>
        </Button>
        <Button onClick={() => void form.handleSubmit()}>Create</Button>
      </header>
      <form.AppForm>
        <form className="grid grid-cols-[1fr_2fr] gap-x-48 gap-y-24">
          <fieldset className="space-y-4">
            <form.AppField name="name">
              {(field) => (
                <field.FormItem>
                  <field.FormLabel htmlFor={nameFieldId}>Name</field.FormLabel>
                  <field.FormControl>
                    <field.Input autoComplete="off" id={nameFieldId} />
                  </field.FormControl>
                  <field.FormDescription>
                    This is your project's name.
                  </field.FormDescription>
                  <field.FormMessage />
                </field.FormItem>
              )}
            </form.AppField>
            <form.AppField name="category">
              {(field) => (
                <field.FormItem>
                  <field.FormLabel htmlFor={categoryFieldId}>
                    Category
                  </field.FormLabel>
                  <field.FormControl>
                    <field.Input id={categoryFieldId} />
                  </field.FormControl>
                  <field.FormDescription>
                    This is the market category your project is focused on.
                  </field.FormDescription>
                  <field.FormMessage />
                </field.FormItem>
              )}
            </form.AppField>
          </fieldset>
          <fieldset className="space-y-4">
            <form.AppField name="objective">
              {(field) => (
                <field.FormItem>
                  <field.FormLabel htmlFor={objectiveFieldId}>
                    Objective
                  </field.FormLabel>
                  <field.FormControl>
                    <field.Textarea id={objectiveFieldId} />
                  </field.FormControl>
                  <field.FormDescription>
                    This is your project's objective.
                  </field.FormDescription>
                  <field.FormMessage />
                </field.FormItem>
              )}
            </form.AppField>
            <form.AppField name="situation">
              {(field) => (
                <field.FormItem>
                  <field.FormLabel htmlFor={situationFieldId}>
                    Situation
                  </field.FormLabel>
                  <field.FormControl>
                    <field.Textarea id={situationFieldId} />
                  </field.FormControl>
                  <field.FormDescription>
                    This is your project's situation.
                  </field.FormDescription>
                  <field.FormMessage />
                </field.FormItem>
              )}
            </form.AppField>
            <form.AppField name="targetAudience">
              {(field) => (
                <field.FormItem>
                  <field.FormLabel htmlFor={targetAudienceFieldId}>
                    Target Audience
                  </field.FormLabel>
                  <field.FormControl>
                    <field.Textarea id={targetAudienceFieldId} />
                  </field.FormControl>
                  <field.FormDescription>
                    This is your project's target audience.
                  </field.FormDescription>
                  <field.FormMessage />
                </field.FormItem>
              )}
            </form.AppField>
          </fieldset>
        </form>
      </form.AppForm>
    </main>
  );
}
