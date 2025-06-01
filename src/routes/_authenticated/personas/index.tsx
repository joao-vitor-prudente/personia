import { convexQuery } from "@convex-dev/react-query";
import { api } from "@server/api";
import { useStore } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";

import { PersonaCard } from "@/components/personas/porsona-card.tsx";
import { Button } from "@/components/ui/button";
import { useAppForm } from "@/components/ui/form.tsx";
import { SelectItem } from "@/components/ui/select.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { TypographyH4, TypographyLarge } from "@/components/ui/typography";

export const Route = createFileRoute("/_authenticated/personas/")({
  component: RouteComponent,
});

const formSchema = z.object({
  search: z.string(),
  sorting: z.enum(["asc", "desc"]),
});

function RouteComponent() {
  const form = useAppForm({
    defaultValues: { search: "", sorting: "asc" } as z.infer<typeof formSchema>,
    validators: { onChange: formSchema },
  });
  const search = useStore(form.store, (state) => state.values.search);
  const sorting = useStore(form.store, (state) => state.values.sorting);

  const personas = useQuery(
    convexQuery(api.functions.personas.listPersonas, { search, sorting }),
  );

  return (
    <main className="px-8 py-4 flex flex-col gap-8">
      <header className="flex items-center justify-between">
        <TypographyH4>Personas</TypographyH4>
        <Button asChild>
          <Link to="/personas/create">Create Persona</Link>
        </Button>
      </header>
      <form.AppForm>
        <form className="flex justify-between">
          <form.AppField name="search">
            {(field) => (
              <field.FormItem>
                <field.FormLabel className="sr-only">Search</field.FormLabel>
                <field.FormControl>
                  <field.Input placeholder="Search" />
                </field.FormControl>
                <field.FormDescription className="sr-only">
                  Name or nickname of the persona to search for
                </field.FormDescription>
                <field.FormMessage />
              </field.FormItem>
            )}
          </form.AppField>
          <form.AppField name="sorting">
            {(field) => (
              <field.FormItem>
                <field.FormLabel className="sr-only">Sorting</field.FormLabel>
                <field.FormControl>
                  <field.Select>
                    <SelectItem value="asc">Newest first</SelectItem>
                    <SelectItem value="desc">Oldest first</SelectItem>
                  </field.Select>
                </field.FormControl>
                <field.FormDescription className="sr-only">
                  How to sort the personas based on the creation date
                </field.FormDescription>
                <field.FormMessage />
              </field.FormItem>
            )}
          </form.AppField>
        </form>
      </form.AppForm>
      <ul className="grid grid-cols-[repeat(auto-fit,minmax(24rem,1fr))] gap-4">
        {personas.isLoading ? (
          Array.from({ length: 12 }, (_, i) => (
            <Skeleton className="h-96" key={i} />
          ))
        ) : personas.isError ? (
          <TypographyLarge>Something went wrong</TypographyLarge>
        ) : personas.data === undefined || personas.data.length === 0 ? (
          <TypographyLarge>No personas found</TypographyLarge>
        ) : (
          personas.data.map((persona) => (
            <li key={persona._id}>
              <PersonaCard persona={persona} />
            </li>
          ))
        )}
      </ul>
    </main>
  );
}
