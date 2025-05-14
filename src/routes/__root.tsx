import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { UserButton } from "@clerk/clerk-react";

export const Route = createRootRoute({
  component: () => (
    <>
      <header className="sticky top-0 z-10 bg-light dark:bg-dark p-4 border-b-2 border-slate-200 dark:border-slate-800 flex flex-row justify-between items-center">
        Convex + React + Clerk
        <UserButton />
      </header>
      <main>
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </>
  ),
});