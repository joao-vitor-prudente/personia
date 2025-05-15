import { api } from "@api";
import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/personas")({
  component: RouteComponent,
});

function RouteComponent() {
  const personas = useQuery(convexQuery(api.personas.listPersonas, {}));
  return (
    <main>
      <h1>Personas</h1>
      <Link to="/personas">Create Persona</Link>
      <ul>
        {personas.data?.map((p) => (
          <li key={p._id}>
            <Link to="/personas">{p.name}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
