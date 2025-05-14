import { useAuth } from "@clerk/clerk-react";
import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_unauthenticated")({
  component: RouteComponent,
});

function RouteComponent() {
  const auth = useAuth();
  if (!auth.isSignedIn) return <Outlet />;
  return <Navigate to="/home" />;
}
