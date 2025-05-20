import { convexQuery } from "@convex-dev/react-query";
import { api } from "@server/api";
import { useStore } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";

import { ProjectCard } from "@/components/projects/project-card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useAppForm } from "@/components/ui/form.tsx";
import { SelectItem } from "@/components/ui/select.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { TypographyH4, TypographyLarge } from "@/components/ui/typography.tsx";

export const Route = createFileRoute("/_authenticated/projects/")({
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

  const projects = useQuery(
    convexQuery(api.projects.listProjects, { search, sorting }),
  );

  return (
    <main className="px-8 py-4 flex flex-col gap-8">
      <header className="flex items-center justify-between">
        <TypographyH4>Projects</TypographyH4>
        <Button asChild>
          <Link to="/projects/create">Create Project</Link>
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
                  Name or nickname of the project to search for
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
                  How to sort the projects based on the creation date
                </field.FormDescription>
                <field.FormMessage />
              </field.FormItem>
            )}
          </form.AppField>
        </form>
      </form.AppForm>
      <ul className="grid grid-cols-[repeat(auto-fit,minmax(24rem,1fr))] gap-4">
        {projects.isLoading ? (
          Array.from({ length: 12 }, (_, i) => (
            <Skeleton className="h-96" key={i} />
          ))
        ) : projects.isError ? (
          <TypographyLarge>Something went wrong</TypographyLarge>
        ) : projects.data === undefined || projects.data.length === 0 ? (
          <TypographyLarge>No projects found</TypographyLarge>
        ) : (
          projects.data.map((project) => (
            <li key={project._id}>
              <ProjectCard project={project} />
            </li>
          ))
        )}
      </ul>
    </main>
  );
}
