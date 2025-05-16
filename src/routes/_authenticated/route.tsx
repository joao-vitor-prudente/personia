import { RedirectToSignIn, useAuth, UserButton } from "@clerk/clerk-react";
import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";

import { ModeToggle } from "@/components/ui/mode-toggle.tsx";
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
  const location = useLocation();

  if (!auth.isLoaded) return null;
  if (!auth.isSignedIn) return <RedirectToSignIn />;

  return (
    <>
      <header className="flex items-center gap-8 px-8 py-4 border-b">
        <TypographyH3>Personia</TypographyH3>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                data-active={location.pathname === "/personas"}
              >
                <Link to="/personas">Personas</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                data-active={location.pathname === "/projects"}
              >
                <Link to="/projects">Projects</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="m-auto" />
        <UserButton />
        <ModeToggle />
      </header>
      <Outlet />
    </>
  );
}
