import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "@server/api";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useId } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button.tsx";
import { useAppForm } from "@/components/ui/form.tsx";
import { SelectItem } from "@/components/ui/select.tsx";
import {
  TypographyH4,
  TypographyH5,
  TypographyMuted,
} from "@/components/ui/typography.tsx";

export const Route = createFileRoute("/_authenticated/personas/create")({
  component: RouteComponent,
});

const formSchema = z.object({
  background: z.string(),
  demographicProfile: z.object({
    age: z.number(),
    country: z.string(),
    gender: z.enum(["male", "female"]),
    occupation: z.string(),
    state: z.string(),
  }),
  name: z.string(),
  nickname: z.string(),
  quote: z.string(),
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const mutation = useMutation({
    mutationFn: useConvexMutation(api.personas.createPersona),
    onError: (error) => toast.error(error.message),
    onSuccess: (data: typeof api.personas.createPersona._returnType) =>
      navigate({ params: { id: data }, to: "/personas/$id" }),
  });
  const form = useAppForm({
    defaultValues: {
      background: "",
      demographicProfile: {
        age: 0,
        country: "",
        gender: "male",
        occupation: "",
        state: "",
      },
      name: "",
      nickname: "",
      quote: "",
    } as z.infer<typeof formSchema>,
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    },
    validators: { onChange: formSchema },
  });
  const nameFieldId = useId();
  const nicknameFieldId = useId();
  const quoteFieldId = useId();
  const backgroundFieldId = useId();
  const ageFieldId = useId();
  const genderFieldId = useId();
  const countryFieldId = useId();
  const stateFieldId = useId();
  const occupationFieldId = useId();

  return (
    <main className="px-8 py-4 flex flex-col gap-8">
      <header className="w-full grid grid-cols-[1fr_auto_auto] gap-4">
        <TypographyH4>Create Persona</TypographyH4>
        <Button asChild variant="secondary">
          <Link to="..">Return</Link>
        </Button>
        <Button onClick={() => void form.handleSubmit()}>Create</Button>
      </header>
      <form.AppForm>
        <form className="grid grid-cols-[1fr_2fr] gap-x-48 gap-y-24">
          <fieldset className="space-y-4 row-span-2">
            <form.AppField name="name">
              {(field) => (
                <field.FormItem>
                  <field.FormLabel htmlFor={nameFieldId}>Name</field.FormLabel>
                  <field.FormControl>
                    <field.Input id={nameFieldId} />
                  </field.FormControl>
                  <field.FormDescription>
                    This is your persona's name.
                  </field.FormDescription>
                  <field.FormMessage />
                </field.FormItem>
              )}
            </form.AppField>
            <form.AppField name="nickname">
              {(field) => (
                <field.FormItem>
                  <field.FormLabel htmlFor={nicknameFieldId}>
                    Nickname
                  </field.FormLabel>
                  <field.FormControl>
                    <field.Input id={nicknameFieldId} />
                  </field.FormControl>
                  <field.FormDescription>
                    This is your persona's nickname.
                  </field.FormDescription>
                  <field.FormMessage />
                </field.FormItem>
              )}
            </form.AppField>
            <form.AppField name="quote">
              {(field) => (
                <field.FormItem>
                  <field.FormLabel htmlFor={quoteFieldId}>
                    Quote
                  </field.FormLabel>
                  <field.FormControl>
                    <field.Textarea id={quoteFieldId} />
                  </field.FormControl>
                  <field.FormDescription>
                    This is a quote from your persona.
                  </field.FormDescription>
                  <field.FormMessage />
                </field.FormItem>
              )}
            </form.AppField>
          </fieldset>
          <fieldset>
            <form.AppField name="background">
              {(field) => (
                <field.FormItem>
                  <field.FormLabel htmlFor={backgroundFieldId}>
                    Background
                  </field.FormLabel>
                  <field.FormControl>
                    <field.Textarea id={backgroundFieldId} />
                  </field.FormControl>
                  <field.FormDescription>
                    This is your persona's background.
                  </field.FormDescription>
                  <field.FormMessage />
                </field.FormItem>
              )}
            </form.AppField>
          </fieldset>
          <fieldset className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <TypographyH5>Demographic Profile</TypographyH5>
              <TypographyMuted>
                Demographic data helps us understand the social and economic
                context that the persona lives in.
              </TypographyMuted>
            </div>
            <form.AppField name="demographicProfile.age">
              {(field) => (
                <field.FormItem>
                  <field.FormLabel htmlFor={ageFieldId}>Age</field.FormLabel>
                  <field.FormControl>
                    <field.Input id={ageFieldId} type="number" />
                  </field.FormControl>
                  <field.FormDescription>
                    This is your persona's age.
                  </field.FormDescription>
                  <field.FormMessage />
                </field.FormItem>
              )}
            </form.AppField>
            <form.AppField name="demographicProfile.gender">
              {(field) => (
                <field.FormItem>
                  <field.FormLabel htmlFor={genderFieldId}>
                    Gender
                  </field.FormLabel>
                  <field.FormControl>
                    <field.Select className="w-full" id={genderFieldId}>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </field.Select>
                  </field.FormControl>
                  <field.FormDescription>
                    This is your persona's gender.
                  </field.FormDescription>
                  <field.FormMessage />
                </field.FormItem>
              )}
            </form.AppField>
            <form.AppField name="demographicProfile.country">
              {(field) => (
                <field.FormItem>
                  <field.FormLabel htmlFor={countryFieldId}>
                    Country
                  </field.FormLabel>
                  <field.FormControl>
                    <field.Input id={countryFieldId} />
                  </field.FormControl>
                  <field.FormDescription>
                    This is your persona's country.
                  </field.FormDescription>
                  <field.FormMessage />
                </field.FormItem>
              )}
            </form.AppField>
            <form.AppField name="demographicProfile.state">
              {(field) => (
                <field.FormItem>
                  <field.FormLabel htmlFor={stateFieldId}>
                    State
                  </field.FormLabel>
                  <field.FormControl>
                    <field.Input id={stateFieldId} />
                  </field.FormControl>
                  <field.FormDescription>
                    This is your persona's state.
                  </field.FormDescription>
                  <field.FormMessage />
                </field.FormItem>
              )}
            </form.AppField>
            <form.AppField name="demographicProfile.occupation">
              {(field) => (
                <field.FormItem className="col-span-2">
                  <field.FormLabel htmlFor={occupationFieldId}>
                    Occupation
                  </field.FormLabel>
                  <field.FormControl>
                    <field.Input id={occupationFieldId} />
                  </field.FormControl>
                  <field.FormDescription>
                    This is your persona's occupation.
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
