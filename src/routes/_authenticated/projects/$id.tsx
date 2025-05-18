import type { Id } from "@server/dataModel";

import { convexQuery } from "@convex-dev/react-query";
import { api } from "@server/api";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Copy, Info, Pencil, Plus, Target, Trash, Users } from "lucide-react";

import { Button } from "@/components/ui/button.tsx";
import {
  TypographyH4,
  TypographyMuted,
  TypographySmall,
} from "@/components/ui/typography.tsx";

export const Route = createFileRoute("/_authenticated/projects/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const projectId = Route.useParams().id;
  const project = useQuery(
    convexQuery(api.projects.getProject, { id: projectId as Id<"projects"> }),
  );

  if (!project.data) return null;

  return (
    <main className="py-4 px-8 grid grid-cols-[1fr_2fr] gap-x-48 gap-y-8">
      <header className="grid grid-cols-[1fr_auto] col-span-2">
        <div>
          <TypographyH4>{project.data.name}</TypographyH4>
          <TypographyMuted>{project.data.category}</TypographyMuted>
        </div>
        <nav>
          <ul className="flex gap-2">
            <li>
              <Button variant="outline">
                <Trash />
                Delete
              </Button>
            </li>
            <li>
              <Button variant="outline">
                <Copy />
                Copy
              </Button>
            </li>
            <li>
              <Button variant="outline">
                <Pencil />
                Edit
              </Button>
            </li>
            <li>
              <Button>
                <Plus />
                Create new experiment
              </Button>
            </li>
          </ul>
        </nav>
      </header>
      <section className="space-y-8">
        <ul className="space-y-2">
          <li className="flex gap-1 items-center">
            <Target />
            <TypographySmall>{project.data.objective}</TypographySmall>
          </li>
          <li className="flex gap-1 items-center">
            <Info />
            <TypographySmall>{project.data.situation}</TypographySmall>
          </li>
          <li className="flex gap-1 items-center">
            <Users />
            <TypographySmall>{project.data.targetAudience}</TypographySmall>
          </li>
        </ul>
      </section>
    </main>
  );
}
