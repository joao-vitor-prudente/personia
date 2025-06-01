import type { Id } from "@server/dataModel";

import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@server/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { usePaginatedQuery } from "convex/react";
import {
  Copy,
  ExternalLink,
  Loader,
  MessageCircleMore,
  Pencil,
  Trash,
  User,
} from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";

import { CreateExperimentDialog } from "@/components/experiments/create-experiment-dialog.tsx";
import { DeleteExperimentDialog } from "@/components/experiments/delete-experiment-dialog.tsx";
import { EditExperimentDialog } from "@/components/experiments/edit-experiment-dialog.tsx";
import { useScroll } from "@/components/hooks/use-scroll.ts";
import { MessageCard } from "@/components/messages/message-card.tsx";
import {
  MessageForm,
  useMessageForm,
} from "@/components/messages/message-form.tsx";
import { Accordion, AccordionItem } from "@/components/ui/accordion.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Dialog, DialogTrigger } from "@/components/ui/dialog.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import {
  TypographyH4,
  TypographyMuted,
  TypographySmall,
} from "@/components/ui/typography.tsx";

export const Route = createFileRoute("/_authenticated/experiments/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const experimentId = Route.useParams().id as Id<"experiments">;
  const navigate = Route.useNavigate();
  const experiment = useQuery(
    convexQuery(api.functions.experiments.getExperiment, { id: experimentId }),
  );

  const deleteExperiment = useMutation({
    mutationFn: useConvexMutation(api.functions.experiments.deleteExperiment),
    onError: (error) => toast.error(error.message),
    onSuccess: () =>
      navigate({
        params: { id: experiment.data?.projectId },
        to: "/projects/$id",
      }),
  });

  const messages = usePaginatedQuery(
    api.functions.messages.listMessages,
    { experimentId: experimentId },
    { initialNumItems: 20 },
  );

  const containerRef = useRef<HTMLDivElement>(null);
  useScroll(containerRef, {
    onBottomReached: () => {
      messages.loadMore(20);
    },
  });

  const form = useMessageForm({ experimentId });

  if (!experiment.data) return null;

  return (
    <main className="flex flex-col grow px-8 py-4 gap-4 overflow-hidden">
      <header className="flex justify-between">
        <TypographyH4>{experiment.data.name}</TypographyH4>
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
                <DeleteExperimentDialog
                  deleteExperiment={() => {
                    deleteExperiment.mutate({ id: experimentId });
                  }}
                  name={experiment.data.name}
                />
              </Dialog>
            </li>
            <li>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Copy />
                    Copy
                  </Button>
                </DialogTrigger>
                <CreateExperimentDialog
                  fromExperiment={experiment.data}
                  onCreate={(id) =>
                    navigate({ params: { id }, to: "/projects/$id" })
                  }
                />
              </Dialog>
            </li>
            <li>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Pencil />
                    Edit
                  </Button>
                </DialogTrigger>
                <EditExperimentDialog experiment={experiment.data} />
              </Dialog>
            </li>
          </ul>
        </nav>
      </header>

      <section className="flex flex-col grow bg-card overflow-hidden rounded-lg">
        <header className="flex items-center gap-2 p-4">
          <MessageCircleMore />
          <TypographySmall>{experiment.data.name}</TypographySmall>
          <TypographySmall>•</TypographySmall>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <TypographyMuted className="underline-offset-4 hover:underline">
                <span>{experiment.data.personas.length}</span>
                <span> participant(s)</span>
              </TypographyMuted>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {experiment.data.personas.map((p) => (
                <DropdownMenuItem asChild className="group" key={p._id}>
                  <Link
                    className="grid grid-cols-[auto_1fr_auto] items-center"
                    params={{ id: p._id }}
                    to="/personas/$id"
                  >
                    <User className="size-8" />
                    <div>
                      <TypographySmall>{p.name}</TypographySmall>
                      <TypographyMuted>{p.nickname}</TypographyMuted>
                    </div>
                    <ExternalLink className="size-6 ml-8 self-start opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <div className="p-2 flex grow overflow-hidden">
          <Accordion
            className="flex-1 overflow-y-auto flex gap-4 scrollbar scrollbar-thumb-rounded-md scrollbar-thumb-muted-foreground scrollbar-track-accent p-2 flex-col-reverse"
            collapsible
            ref={containerRef}
            type="single"
          >
            {messages.results.map((message) => (
              <MessageCard key={message._id} message={message} />
            ))}
            <AccordionItem
              disabled
              hidden={messages.status !== "LoadingMore"}
              value="loader"
            >
              <Loader className="animate-spin m-auto" />
            </AccordionItem>
          </Accordion>
        </div>

        <footer className="p-4">
          <MessageForm form={form} />
        </footer>
      </section>
    </main>
  );
}
