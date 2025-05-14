import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RedirectToSignIn, useAuth } from "@clerk/clerk-react";

export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
});

function RouteComponent() {
  const auth = useAuth();
  if (auth.isSignedIn) return <Outlet />;
  return <RedirectToSignIn />;
}
