import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@server/api";
import { type Id } from "@server/dataModel";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BriefcaseBusiness,
  Cake,
  Copy,
  MapPin,
  Mars,
  MessageCircleMore,
  Pencil,
  Trash,
  Venus,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import {
  TypographyBlockquote,
  TypographyH4,
  TypographyH5,
  TypographyMuted,
  TypographySmall,
} from "@/components/ui/typography.tsx";

export const Route = createFileRoute("/_authenticated/personas/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const personaId = Route.useParams().id as Id<"personas">;
  const navigate = Route.useNavigate();
  const persona = useQuery(
    convexQuery(api.personas.getPersona, { id: personaId }),
  );

  const deletePersona = useMutation({
    mutationFn: useConvexMutation(api.personas.deletePersona),
    onError: (error) => toast.error(error.message),
    onSuccess: () => navigate({ to: "/personas" }),
  });

  if (!persona.data) return null;

  return (
    <main className="py-4 px-8 grid grid-cols-[1fr_2fr] gap-x-48 gap-y-8">
      <header className="grid grid-cols-[1fr_auto] col-span-2">
        <div>
          <TypographyH4>{persona.data.name}</TypographyH4>
          <TypographyMuted>{persona.data.nickname}</TypographyMuted>
        </div>
        <nav>
          <ul className="flex gap-2">
            <li>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Trash />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Persona</DialogTitle>
                    <DialogDescription>
                      <span>Are you sure you want to delete </span>
                      <span>{persona.data.name}</span>
                      <span>?</span>
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        onClick={() => {
                          deletePersona.mutate({ id: personaId });
                        }}
                        variant="destructive"
                      >
                        Confirm
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </li>
            <li>
              <Button asChild variant="outline">
                <Link search={{ from: personaId }} to="/personas/create">
                  <Copy />
                  Copy
                </Link>
              </Button>
            </li>
            <li>
              <Button asChild variant="outline">
                <Link params={{ id: personaId }} to="/personas/edit/$id">
                  <Pencil />
                  Edit
                </Link>
              </Button>
            </li>
            <li>
              <Button>
                <MessageCircleMore />
                Chat
              </Button>
            </li>
          </ul>
        </nav>
      </header>
      <div className="space-y-8">
        <section>
          <TypographyBlockquote>{persona.data.quote}</TypographyBlockquote>
        </section>
        <section className="space-y-4">
          <TypographyH5>Demographic Profile</TypographyH5>
          <ul>
            <ul className="space-y-4">
              <li className="flex gap-1 items-center">
                <Cake />
                <TypographySmall className="space-x-1">
                  <span>{persona.data.demographicProfile.age}</span>
                  <span>years</span>
                </TypographySmall>
              </li>
              <li className="flex gap-1 items-center">
                {persona.data.demographicProfile.gender === "male" ? (
                  <Mars />
                ) : (
                  <Venus />
                )}
                <TypographySmall>
                  {persona.data.demographicProfile.gender === "male"
                    ? "Male"
                    : "Female"}
                </TypographySmall>
              </li>
              <li className="flex gap-1 items-center">
                <MapPin />
                <TypographySmall className="space-x-1">
                  <span>{persona.data.demographicProfile.country}</span>
                  <span>-</span>
                  <span>{persona.data.demographicProfile.state}</span>
                </TypographySmall>
              </li>
              <li className="flex gap-1 items-center">
                <BriefcaseBusiness />
                <TypographySmall>
                  {persona.data.demographicProfile.occupation}
                </TypographySmall>
              </li>
            </ul>
          </ul>
        </section>
      </div>
      <div>
        <section className="space-y-4">
          <TypographyH5>Background</TypographyH5>
          <div className="bg-accent p-2 rounded-md">
            <TypographySmall>{persona.data.background}</TypographySmall>
          </div>
        </section>
      </div>
    </main>
  );
}
