'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronLeft, ChevronRight, LogOut, Sun } from 'lucide-react'
import { getNavItems } from '@/config/navigation'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

// ─── Tooltip simple para iconos colapsados ────────────────────────────────────
function IconTooltip({
    label,
    children,
}: {
    label: string
    children: React.ReactNode
}) {
    return (
        <div className="relative group/tip flex items-center">
            {children}
            <div className="pointer-events-none absolute left-full ml-2 z-50 hidden group-hover/tip:flex items-center">
                <div className="rounded-md bg-popover border border-border px-2 py-1 text-xs font-medium text-popover-foreground shadow-md whitespace-nowrap">
                    {label}
                </div>
            </div>
        </div>
    )
}

// ─── Sidebar (desktop) ────────────────────────────────────────────────────────
function DesktopSidebar() {
    const [collapsed, setCollapsed] = useState(false)
    const pathname = usePathname()
    const { user, logout } = useAuth()
    const navItems = user ? getNavItems(user.role) : []

    return (
        <aside
            className={cn(
                'hidden lg:flex flex-col h-screen sticky top-0 border-r border-border bg-card transition-all duration-300 ease-in-out shrink-0',
                collapsed ? 'w-16' : 'w-56'
            )}
        >
            {/* Logo + toggle */}
            <div
                className={cn(
                    'flex items-center h-14 border-b border-border px-3 shrink-0',
                    collapsed ? 'justify-center' : 'justify-between'
                )}
            >
                {!collapsed && (
                    <span className="text-sm font-bold tracking-tight text-foreground truncate">
                        DentalApp
                    </span>
                )}
                <button
                    onClick={() => setCollapsed((c) => !c)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
                    aria-label={
                        collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'
                    }
                >
                    {collapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </button>
            </div>

            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 flex flex-col gap-0.5">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const active =
                        pathname === item.href ||
                        pathname.startsWith(item.href + '/')

                    const linkContent = (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-colors',
                                active
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                collapsed && 'justify-center px-0'
                            )}
                        >
                            <Icon className="h-4 w-4 shrink-0" />
                            {!collapsed && (
                                <span className="truncate">{item.label}</span>
                            )}
                        </Link>
                    )

                    return collapsed ? (
                        <IconTooltip key={item.href} label={item.label}>
                            {linkContent}
                        </IconTooltip>
                    ) : (
                        linkContent
                    )
                })}
            </nav>

            {/* Footer: usuario + acciones */}
            <div className="shrink-0 border-t border-border p-2 flex flex-col gap-0.5">
                {/* Modo claro/oscuro */}
                {collapsed ? (
                    <IconTooltip label="Cambiar tema">
                        <button
                            className={cn(
                                'flex w-full items-center justify-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
                            )}
                        >
                            <Sun className="h-4 w-4 shrink-0" />
                        </button>
                    </IconTooltip>
                ) : (
                    <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                        <Sun className="h-4 w-4 shrink-0" />
                        <span>Cambiar tema</span>
                    </button>
                )}

                {/* Cerrar sesión */}
                {collapsed ? (
                    <IconTooltip label="Cerrar sesión">
                        <button
                            onClick={logout}
                            className="flex w-full items-center justify-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                            <LogOut className="h-4 w-4 shrink-0" />
                        </button>
                    </IconTooltip>
                ) : (
                    <button
                        onClick={logout}
                        className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                        <LogOut className="h-4 w-4 shrink-0" />
                        <span>Cerrar sesión</span>
                    </button>
                )}

                {/* Info del usuario */}
                {!collapsed && user && (
                    <div className="mt-1 rounded-lg bg-muted/50 px-2 py-2">
                        <p className="text-xs font-medium text-foreground truncate">
                            {user.email}
                        </p>
                        <p className="text-[10px] text-muted-foreground capitalize">
                            {user.role}
                        </p>
                    </div>
                )}
            </div>
        </aside>
    )
}

// ─── Navbar (mobile) ──────────────────────────────────────────────────────────
function MobileNavbar() {
    const [open, setOpen] = useState(false)
    const pathname = usePathname()
    const { user, logout } = useAuth()
    const navItems = user ? getNavItems(user.role) : []

    // Cierra el menú al navegar
    useEffect(() => {
        setOpen(false)
    }, [pathname])

    // Bloquea scroll cuando el menú está abierto
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : ''
        return () => {
            document.body.style.overflow = ''
        }
    }, [open])

    return (
        <>
            {/* Barra superior */}
            <header className="lg:hidden sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card/95 backdrop-blur px-4">
                <span className="text-sm font-bold tracking-tight text-foreground">
                    DentalApp
                </span>
                <div className="flex items-center gap-1">
                    {/* Tema */}
                    <button className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors">
                        <Sun className="h-4 w-4" />
                    </button>
                    {/* Hamburguesa */}
                    <button
                        onClick={() => setOpen((o) => !o)}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors"
                        aria-label="Abrir menú"
                    >
                        {open ? (
                            <X className="h-4 w-4" />
                        ) : (
                            <Menu className="h-4 w-4" />
                        )}
                    </button>
                </div>
            </header>

            {/* Overlay */}
            {open && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Drawer */}
            <div
                className={cn(
                    'lg:hidden fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 ease-in-out',
                    open ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Header del drawer */}
                <div className="flex h-14 items-center justify-between px-4 border-b border-border shrink-0">
                    <span className="text-sm font-bold tracking-tight">
                        DentalApp
                    </span>
                    <button
                        onClick={() => setOpen(false)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Nav items */}
                <nav className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-0.5">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const active =
                            pathname === item.href ||
                            pathname.startsWith(item.href + '/')
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                    active
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                )}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div className="shrink-0 border-t border-border p-2 flex flex-col gap-0.5">
                    <button
                        onClick={logout}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                        <LogOut className="h-4 w-4 shrink-0" />
                        Cerrar sesión
                    </button>
                    {user && (
                        <div className="mt-1 rounded-lg bg-muted/50 px-3 py-2">
                            <p className="text-xs font-medium text-foreground truncate">
                                {user.email}
                            </p>
                            <p className="text-[10px] text-muted-foreground capitalize">
                                {user.role}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export { DesktopSidebar, MobileNavbar }
