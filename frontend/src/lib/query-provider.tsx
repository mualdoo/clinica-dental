'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, type ReactNode } from 'react'

export function QueryProvider({ children }: { children: ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000, // 1 min
                        refetchOnWindowFocus: false,
                        retry: (failureCount, error: unknown) => {
                            // No reintentar si es un 401 o 403
                            if (
                                error instanceof Error &&
                                'status' in error &&
                                ((error as { status: number }).status === 401 ||
                                    (error as { status: number }).status ===
                                        403)
                            ) {
                                return false
                            }
                            return failureCount < 2
                        },
                    },
                },
            })
    )

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools initialIsOpen={false} />
            )}
        </QueryClientProvider>
    )
}
