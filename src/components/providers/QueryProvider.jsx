"use client";

import { useState } from "react";

/**
 * React Query provider component
 * Provides data fetching, caching, and synchronization
 * 
 * Usage in layout:
 * <QueryProvider>
 *   {children}
 * </QueryProvider>
 */
export default function QueryProvider({ children }) {
  let QueryClient = null;
  let QueryClientProvider = null;
  
  // Try to import @tanstack/react-query, fallback gracefully if not installed
  try {
    const reactQuery = require("@tanstack/react-query");
    QueryClient = reactQuery.QueryClient;
    QueryClientProvider = reactQuery.QueryClientProvider;
  } catch (e) {
    // Package not installed yet, provider will just render children
    console.warn("@tanstack/react-query not installed. QueryProvider will render children without React Query.");
    return <>{children}</>;
  }

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000, // 30 seconds
            refetchOnWindowFocus: false,
            retry: 1,
            retryDelay: 1000,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

