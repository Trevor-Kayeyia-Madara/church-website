"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { SiteProvider } from "@/lib/siteContext";
import { RouteLoadingProvider } from "@/lib/routeLoadingContext";
import RouteLoadingOverlay from "@/components/RouteLoadingOverlay";

export default function Providers({ children, site }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <RouteLoadingProvider>
        <SiteProvider value={site}>
          <RouteLoadingOverlay />
          {children}
        </SiteProvider>
      </RouteLoadingProvider>
    </QueryClientProvider>
  );
}
