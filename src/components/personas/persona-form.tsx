import { useId } from "react";
import { z } from "zod";

import { useAppForm } from "@/components/ui/form.tsx";
import { SelectItem } from "@/components/ui/select.tsx";
import { TypographyH5, TypographyMuted } from "@/components/ui/typography.tsx";

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

type FormData = z.infer<typeof formSchema>;

const defaultValues: FormData = {
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
};

type Form = ReturnType<typeof usePersonaForm>;

export function PersonaForm(props: { form: Form }) {
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
    <props.form.AppForm>
      <form className="grid grid-cols-[1fr_2fr] gap-x-48 gap-y-24">
        <fieldset className="space-y-4 row-span-2">
          <props.form.AppField name="name">
            {(field) => (
              <field.FormItem>
                <field.FormLabel htmlFor={nameFieldId}>Name</field.FormLabel>
                <field.FormControl>
                  <field.Input autoComplete="off" id={nameFieldId} />
                </field.FormControl>
                <field.FormDescription>
                  This is your persona's name.
                </field.FormDescription>
                <field.FormMessage />
              </field.FormItem>
            )}
          </props.form.AppField>
          <props.form.AppField name="nickname">
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
          </props.form.AppField>
          <props.form.AppField name="quote">
            {(field) => (
              <field.FormItem>
                <field.FormLabel htmlFor={quoteFieldId}>Quote</field.FormLabel>
                <field.FormControl>
                  <field.Textarea id={quoteFieldId} />
                </field.FormControl>
                <field.FormDescription>
                  This is a quote from your persona.
                </field.FormDescription>
                <field.FormMessage />
              </field.FormItem>
            )}
          </props.form.AppField>
        </fieldset>
        <fieldset>
          <props.form.AppField name="background">
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
          </props.form.AppField>
        </fieldset>
        <fieldset className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <TypographyH5>Demographic Profile</TypographyH5>
            <TypographyMuted>
              Demographic data helps us understand the social and economic
              context that the persona lives in.
            </TypographyMuted>
          </div>
          <props.form.AppField name="demographicProfile.age">
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
          </props.form.AppField>
          <props.form.AppField name="demographicProfile.gender">
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
          </props.form.AppField>
          <props.form.AppField name="demographicProfile.country">
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
          </props.form.AppField>
          <props.form.AppField name="demographicProfile.state">
            {(field) => (
              <field.FormItem>
                <field.FormLabel htmlFor={stateFieldId}>State</field.FormLabel>
                <field.FormControl>
                  <field.Input id={stateFieldId} />
                </field.FormControl>
                <field.FormDescription>
                  This is your persona's state.
                </field.FormDescription>
                <field.FormMessage />
              </field.FormItem>
            )}
          </props.form.AppField>
          <props.form.AppField name="demographicProfile.occupation">
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
          </props.form.AppField>
        </fieldset>
      </form>
    </props.form.AppForm>
  );
}

export function usePersonaForm(props: {
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
