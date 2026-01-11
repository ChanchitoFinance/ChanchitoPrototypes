'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, ReactNode } from 'react'

/**
 * React Query configuration for caching and performance
 * - Ideas list: 5 minutes stale time
 * - Single idea: 1 minute stale time
 * - User votes: 30 seconds stale time
 */

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Default stale time: 1 minute
            staleTime: 60 * 1000,
            // GC time (when unused data is garbage collected): 30 minutes
            gcTime: 30 * 60 * 1000,
            // Retry failed requests 3 times
            retry: 3,
          },
          mutations: {
            // Retry mutations once
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

// Custom query options for specific data types
export const queryOptions = {
  ideas: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  },
  idea: {
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
  },
  userVotes: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  },
  comments: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  },
  trending: {
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  },
}
