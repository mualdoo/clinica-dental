'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export default function QueryProvider({
    children,
}: {
    children: React.ReactNode
}) {
    // Creamos el cliente solo una vez en el ciclo de vida del cliente
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Con microservicios, es bueno tener un tiempo de caché razonable
                        staleTime: 60 * 1000,
                        retry: 1, // No reintentar demasiadas veces si el microservicio falla
                    },
                },
            })
    )

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}
