import { RedirectToSignIn, useAuth, UserButton } from "@clerk/clerk-react";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { TypographyH3 } from "@/components/ui/typography.tsx";

export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
});

function RouteComponent() {
  const auth = useAuth();
  if (!auth.isLoaded) return null;
  if (!auth.isSignedIn) return <RedirectToSignIn />;

  return (
    <>
      <header className="flex items-center justify-between px-8 py-4 border-b">
        <div className="flex gap-8 items-center">
          <TypographyH3>Personia</TypographyH3>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/">Personas</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/">Projects</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <UserButton />
      </header>
      <Outlet />
    </>
  );
}
