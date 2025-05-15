import { SignInButton, SignUpButton } from "@clerk/clerk-react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_unauthenticated/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="flex flex-col gap-8 max-w-lg mx-auto">
      <p>Log in to see the numbers</p>
      <SignInButton mode="modal">
        <button className="bg-dark dark:bg-light text-light dark:text-dark text-sm px-4 py-2 rounded-md border-2">
          Sign in
        </button>
      </SignInButton>
      <SignUpButton mode="modal">
        <button className="bg-dark dark:bg-light text-light dark:text-dark text-sm px-4 py-2 rounded-md border-2">
          Sign up
        </button>
      </SignUpButton>
    </main>
  );
}
