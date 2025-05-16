import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRouter, RouterProvider } from "@tanstack/react-router";

import "./index.css";

import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { ThemeProvider } from "@/components/theme-provider.tsx";
import { Toaster } from "@/components/ui/sonner.tsx";

import { routeTree } from "./routeTree.gen";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);
const convexQueryClient = new ConvexQueryClient(convex);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: convexQueryClient.queryFn(),
      queryKeyHashFn: convexQueryClient.hashFn(),
    },
  },
});
convexQueryClient.connect(queryClient);
const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const root = document.getElementById("root");
if (!root) throw new Error("No root element found");

createRoot(root).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <RouterProvider router={router} />
            <Toaster />
          </ThemeProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  </StrictMode>,
);
