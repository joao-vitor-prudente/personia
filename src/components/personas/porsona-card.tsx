import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "@server/api";
import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  BriefcaseBusiness,
  Cake,
  Copy,
  EllipsisVertical,
  MapPin,
  Mars,
  Pencil,
  Trash,
  User,
  Venus,
} from "lucide-react";
import { toast } from "sonner";

import { DeletePersonaDialog } from "@/components/personas/delete-persona-dialog.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Dialog, DialogTrigger } from "@/components/ui/dialog.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import {
  TypographyBlockquote,
  TypographySmall,
} from "@/components/ui/typography.tsx";

export function PersonaCard(props: {
  persona: typeof api.personas.getPersona._returnType;
}) {
  const deletePersona = useMutation({
    mutationFn: useConvexMutation(api.personas.deletePersona),
    onError: (error) => toast.error(error.message),
  });

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
              <DropdownMenuItem asChild>
                <Link
                  params={{ id: props.persona._id }}
                  to="/personas/edit/$id"
                >
                  <Pencil />
                  Edit
                </Link>
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
              <Dialog>
                <DialogTrigger asChild>
                  <DropdownMenuItem>
                    <Trash />
                    Delete
                  </DropdownMenuItem>
                </DialogTrigger>
                <DeletePersonaDialog
                  deletePersona={() => {
                    deletePersona.mutate({ id: props.persona._id });
                  }}
                  name={props.persona.name}
                />
              </Dialog>
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
      </Card>
    </Link>
  );
}