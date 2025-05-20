import { convexQuery } from "@convex-dev/react-query";
import { api } from "@server/api";
import { useStore } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BriefcaseBusiness,
  Cake,
  Copy,
  EllipsisVertical,
  MapPin,
  Mars,
  MessageCircleMore,
  Pencil,
  Trash,
  User,
  Venus,
} from "lucide-react";
import { useId } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { useAppForm } from "@/components/ui/form.tsx";
import { SelectItem } from "@/components/ui/select.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import {
  TypographyBlockquote,
  TypographyH4,
  TypographyLarge,
  TypographySmall,
} from "@/components/ui/typography";

export const Route = createFileRoute("/_authenticated/personas/")({
  component: RouteComponent,
});

function PersonaCard(props: {
  persona: typeof api.personas.getPersona._returnType;
}) {
  return (
    <Link params={{ id: props.persona._id }} to="/personas/$id">
      <Card className="max-w-lg">
        <CardHeader className="grid-cols-[auto_1fr_auto] gap-4">
          <User />
          <div>
            <CardTitle>{props.persona.name}</CardTitle>
            <CardDescription>{props.persona.nickname}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <EllipsisVertical />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Pencil />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  search={{ from: props.persona._id }}
                  to="/personas/create"
                >
                  <Copy />
                  Copy
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Trash />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li>
              <TypographyBlockquote>{props.persona.quote}</TypographyBlockquote>
            </li>
            <li className="flex gap-1 items-center">
              <Cake />
              <TypographySmall className="space-x-1">
                <span>{props.persona.demographicProfile.age}</span>
                <span>years</span>
              </TypographySmall>
            </li>
            <li className="flex gap-1 items-center">
              {props.persona.demographicProfile.gender === "male" ? (
                <Mars />
              ) : (
                <Venus />
              )}
              <TypographySmall>
                {props.persona.demographicProfile.gender === "male"
                  ? "Male"
                  : "Female"}
              </TypographySmall>
            </li>
            <li className="flex gap-1 items-center">
              <MapPin />
              <TypographySmall className="space-x-1">
                <span>{props.persona.demographicProfile.country}</span>
                <span>-</span>
                <span>{props.persona.demographicProfile.state}</span>
              </TypographySmall>
            </li>
            <li className="flex gap-1 items-center">
              <BriefcaseBusiness />
              <TypographySmall>
                {props.persona.demographicProfile.occupation}
              </TypographySmall>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <CardAction className="w-full">
            <Button className="w-full">
              <MessageCircleMore />
              Chat
            </Button>
          </CardAction>
        </CardFooter>
      </Card>
    </Link>
  );
}

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
    convexQuery(api.personas.listPersonas, { search, sorting }),
  );
  const searchFieldId = useId();
  const sortingFieldId = useId();
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
                <field.FormLabel className="sr-only" htmlFor={searchFieldId}>
                  Search
                </field.FormLabel>
                <field.FormControl>
                  <field.Input id={searchFieldId} placeholder="Search" />
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
                <field.FormLabel className="sr-only" htmlFor={sortingFieldId}>
                  Sorting
                </field.FormLabel>
                <field.FormControl>
                  <field.Select id={sortingFieldId}>
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
