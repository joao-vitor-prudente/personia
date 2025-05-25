import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "@server/api";
import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ClipboardList,
  Copy,
  EllipsisVertical,
  Info,
  Pencil,
  Target,
  Trash,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog.tsx";
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
import { TypographySmall } from "@/components/ui/typography.tsx";

export function ProjectCard(props: {
  project: typeof api.projects.getProject._returnType;
}) {
  const deleteProject = useMutation({
    mutationFn: useConvexMutation(api.projects.deleteProject),
    onError: (error) => toast.error(error.message),
  });
  return (
    <Card className="max-w-lg">
      <CardHeader className="grid-cols-[auto_1fr_auto] gap-4">
        <ClipboardList />
        <Link
          className="underline-offset-4 hover:underline"
          params={{ id: props.project._id }}
          to="/projects/$id"
        >
          <CardTitle>{props.project.name}</CardTitle>
          <CardDescription>{props.project.category}</CardDescription>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <EllipsisVertical />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link params={{ id: props.project._id }} to="/projects/edit/$id">
                <Pencil />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link search={{ from: props.project._id }} to="/projects/create">
                <Copy />
                Copy
              </Link>
            </DropdownMenuItem>
            <Dialog>
              <DialogTrigger asChild>
                <DropdownMenuItem preventDefault>
                  <Trash />
                  Delete
                </DropdownMenuItem>
              </DialogTrigger>
              <DeleteProjectDialog
                deleteProject={() => {
                  deleteProject.mutate({ id: props.project._id });
                }}
                name={props.project.name}
              />
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          <li className="flex gap-1 items-center">
            <Target />
            <TypographySmall>{props.project.objective}</TypographySmall>
          </li>
          <li className="flex gap-1 items-center">
            <Info />
            <TypographySmall>{props.project.situation}</TypographySmall>
          </li>
          <li className="flex gap-1 items-center">
            <Users />
            <TypographySmall>{props.project.targetAudience}</TypographySmall>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}