import type { Id } from "@server/dataModel";

import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@server/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { usePaginatedQuery } from "convex/react";
import {
  Copy,
  ExternalLink,
  MessageCircleMore,
  Pencil,
  Trash,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { CreateExperimentDialog } from "@/components/experiments/create-experiment-dialog.tsx";
import { DeleteExperimentDialog } from "@/components/experiments/delete-experiment-dialog.tsx";
import { EditExperimentDialog } from "@/components/experiments/edit-experiment-dialog.tsx";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Dialog, DialogTrigger } from "@/components/ui/dialog.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { useAppForm } from "@/components/ui/form.tsx";
import {
  TypographyH4,
  TypographyMuted,
  TypographyP,
  TypographySmall,
} from "@/components/ui/typography.tsx";
import { dateFormatter, timeFormatter } from "@/lib/date.ts";

export const Route = createFileRoute("/_authenticated/experiments/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const experimentId = Route.useParams().id as Id<"experiments">;
  const navigate = Route.useNavigate();
  const experiment = useQuery(
    convexQuery(api.experiments.getExperiment, { id: experimentId }),
  );

  const deleteExperiment = useMutation({
    mutationFn: useConvexMutation(api.experiments.deleteExperiment),
    onError: (error) => toast.error(error.message),
    onSuccess: () =>
      navigate({
        params: { id: experiment.data?.projectId },
        to: "/projects/$id",
      }),
  });

  const messages = usePaginatedQuery(
    api.messages.listMessages,
    { experimentId: experimentId },
    { initialNumItems: 5 },
  );

  const createMessage = useMutation({
    mutationFn: useConvexMutation(api.messages.sendMessage),
    onError: (error) => toast.error(error.message),
    onSuccess: () => {
      sendMessageForm.reset();
    },
  });

  const sendMessageForm = useAppForm({
    defaultValues: { message: "" },
    onSubmit: async ({ value }) => {
      await createMessage.mutateAsync({ content: value.message, experimentId });
    },
    validators: { onSubmit: z.object({ message: z.string().min(1) }) },
  });

  if (!experiment.data) return null;

  return (
    <main className="py-4 px-8 grid grid-cols-[2fr_1fr] gap-x-8 gap-y-4 grid-rows-[auto_1fr] grow">
      <header className="grid grid-cols-[1fr_auto] col-span-2">
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
      <section className="bg-card text-card-foreground grow rounded-lg border p-4 shadow-sm col-span-2 grid grid-cols-1 grid-rows-[auto_1fr_auto] gap-y-4">
        <header className="flex items-center gap-2">
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
                <DropdownMenuItem asChild key={p._id}>
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
                    <ExternalLink className="size-6 ml-8 self-start" />
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <Accordion collapsible type="single">
          {messages.results.map((m) => (
            <AccordionItem
              className="flex flex-col gap-4"
              key={m._id}
              value={m._id}
            >
              <AccordionTrigger className="border rounded-lg px-4">
                <div className="grid grid-cols-[1fr_auto] w-full">
                  <TypographyMuted>
                    <span>~</span>
                    <span>{m.author}</span>
                  </TypographyMuted>
                  <TypographyMuted>
                    <span>{timeFormatter.format(m._creationTime)}</span>
                    <span> • </span>
                    <span>{dateFormatter.format(m._creationTime)}</span>
                  </TypographyMuted>
                  <TypographyP className="col-span-2">{m.content}</TypographyP>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Accordion
                  className="flex flex-col gap-2"
                  collapsible
                  type="single"
                >
                  {m.replies.map((r) => (
                    <AccordionItem
                      className="border rounded-lg last:border px-4"
                      key={r.author._id}
                      value={r.author._id}
                    >
                      <AccordionTrigger disabled={r.status === "pending"}>
                        {r.status === "pending" ? (
                          <div>
                            <span>~</span>
                            <span>{r.author.name}</span>
                            <span> is replying...</span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-[1fr_auto] w-full">
                            <TypographyMuted>
                              <span>~</span>
                              <span>{r.author.name}</span>
                            </TypographyMuted>
                            <TypographyMuted>
                              <span>{timeFormatter.format(r.finishedAt)}</span>
                              <span>•</span>
                              <span>{dateFormatter.format(r.finishedAt)}</span>
                            </TypographyMuted>
                          </div>
                        )}
                      </AccordionTrigger>
                      <AccordionContent>
                        {r.status === "finished" ? (
                          <TypographyP>{r.content}</TypographyP>
                        ) : null}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <sendMessageForm.AppForm>
          <form
            className="relative"
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessageForm.handleSubmit();
            }}
          >
            <sendMessageForm.AppField name="message">
              {(field) => (
                <field.FormItem>
                  <field.FormLabel className="sr-only">
                    Send a message
                  </field.FormLabel>
                  <field.FormControl>
                    <field.Textarea className="pr-24" />
                  </field.FormControl>
                  <field.FormMessage className="sr-only" />
                </field.FormItem>
              )}
            </sendMessageForm.AppField>
            <Button
              className="absolute top-1/2 -translate-y-1/2 right-4"
              type="submit"
            >
              Send
            </Button>
          </form>
        </sendMessageForm.AppForm>
      </section>
    </main>
  );
}
