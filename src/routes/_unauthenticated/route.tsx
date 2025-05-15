import { useAuth } from "@clerk/clerk-react";
import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_unauthenticated")({
  component: RouteComponent,
});

function RouteComponent() {
  const auth = useAuth();
  if (!auth.isLoaded) return null;
  if (auth.isSignedIn) return <Navigate to="/personas" />;

  return <Outlet />;
}
