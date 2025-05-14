import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { api } from "../../../convex/_generated/api";

export const Route = createFileRoute("/_authenticated/home")({
  component: RouteComponent,
});

function ResourceCard({
  description,
  href,
  title,
}: {
  description: string;
  href: string;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-2 bg-slate-200 dark:bg-slate-800 p-4 rounded-md h-28 overflow-auto">
      <a className="text-sm underline hover:no-underline" href={href}>
        {title}
      </a>
      <p className="text-xs">{description}</p>
    </div>
  );
}

function RouteComponent() {
  const query = useQuery(
    convexQuery(api.myFunctions.listNumbers, { count: 10 }),
  );
  const addNumber = useMutation({
    mutationFn: useConvexMutation(api.myFunctions.addNumber),
  });

  if (!query.data) {
    return (
      <div className="mx-auto">
        <p>loading... (consider a loading skeleton)</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-lg mx-auto">
      <p>Welcome {query.data.viewer ?? "Anonymous"}!</p>
      <p>
        Click the button below and open this page in another window - this data
        is persisted in the Convex cloud database!
      </p>
      <p>
        <button
          className="bg-dark dark:bg-light text-light dark:text-dark text-sm px-4 py-2 rounded-md border-2"
          onClick={() => {
            addNumber.mutate({ value: Math.floor(Math.random() * 10) });
          }}
        >
          Add a random number
        </button>
      </p>
      <p>
        Numbers:{" "}
        {query.data.numbers.length === 0
          ? "Click the button!"
          : query.data.numbers.join(", ")}
      </p>
      <p>
        Edit{" "}
        <code className="text-sm font-bold font-mono bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded-md">
          convex/myFunctions.ts
        </code>{" "}
        to change your backend
      </p>
      <p>
        Edit{" "}
        <code className="text-sm font-bold font-mono bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded-md">
          src/App.tsx
        </code>{" "}
        to change your frontend
      </p>
      <div className="flex flex-col">
        <p className="text-lg font-bold">Useful resources:</p>
        <div className="flex gap-2">
          <div className="flex flex-col gap-2 w-1/2">
            <ResourceCard
              description="Read comprehensive documentation for all Convex features."
              href="https://docs.convex.dev/home"
              title="Convex docs"
            />
            <ResourceCard
              description="Learn about best practices, use cases, and more from a growing
            collection of articles, videos, and walkthroughs."
              href="https://www.typescriptlang.org/docs/handbook/2/basic-types.html"
              title="Stack articles"
            />
          </div>
          <div className="flex flex-col gap-2 w-1/2">
            <ResourceCard
              description="Browse our collection of templates to get started quickly."
              href="https://www.convex.dev/templates"
              title="Templates"
            />
            <ResourceCard
              description="Join our developer community to ask questions, trade tips & tricks,
            and show off your projects."
              href="https://www.convex.dev/community"
              title="Discord"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
