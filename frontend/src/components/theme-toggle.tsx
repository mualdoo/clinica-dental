'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
    const [mounted, setMounted] = useState(false)
    const { theme, setTheme } = useTheme()

    // Evita el error de hidratación esperando a que el componente se monte en el cliente
    useEffect(() => {
        setMounted(true)
    }, [])

    // Retorna un botón vacío o un "skeleton" para evitar saltos en el layout (layout shift)
    if (!mounted) {
        return (
            <Button variant="outline" size="icon" aria-label="Cargando tema">
                <span className="h-5 w-5" />
            </Button>
        )
    }

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Alternar tema"
        >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
    )
}
