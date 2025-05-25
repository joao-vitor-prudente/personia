import { type api } from "@server/api";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion.tsx";
import { TypographyMuted, TypographyP } from "@/components/ui/typography.tsx";
import { dateFormatter, timeFormatter } from "@/lib/date.ts";

export function MessageCard(props: {
  message: (typeof api.messages.listMessages._returnType)["page"][number];
}) {
  return (
    <AccordionItem className="flex flex-col gap-4" value={props.message._id}>
      <AccordionTrigger className="border rounded-lg px-4">
        <div className="grid grid-cols-[1fr_auto] w-full">
          <TypographyMuted>
            <span>~</span>
            <span>{props.message.author}</span>
          </TypographyMuted>
          <TypographyMuted>
            <span>{timeFormatter.format(props.message._creationTime)}</span>
            <span> • </span>
            <span>{dateFormatter.format(props.message._creationTime)}</span>
          </TypographyMuted>
          <TypographyP className="col-span-2">
            {props.message.content}
          </TypographyP>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <Accordion className="flex flex-col gap-2" collapsible type="single">
          {props.message.replies.map((r) => (
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
  );
}