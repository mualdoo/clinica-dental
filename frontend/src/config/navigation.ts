import {
    CalendarDays,
    Users,
    LayoutDashboard,
    ClipboardList,
    Settings,
    UserCog,
    Building2,
    FileText,
    type LucideIcon,
    Archive,
    Receipt,
    ReceiptText,
    Banknote,
} from 'lucide-react'
import type { UserRole } from '@/types/auth'

export interface NavItem {
    label: string
    href: string
    icon: LucideIcon
}

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
    admin: [
        { label: 'Agenda', href: '/agenda', icon: CalendarDays },
        { label: 'Pacientes', href: '/pacientes', icon: Users },
        { label: 'Presupuestos', href: '/presupuestos', icon: ReceiptText },
        { label: 'Usuarios', href: '/ajustes/usuarios', icon: UserCog },
        { label: 'Cubículos', href: '/ajustes/cubiculos', icon: Building2 },
        {
            label: 'Tratamientos',
            href: '/ajustes/tratamientos',
            icon: FileText,
        },
        { label: 'Facturación', href: '/ajustes/facturacion', icon: Receipt },
        { label: 'Inventario', href: '/ajustes/inventario', icon: Archive },
    ],
    dentist: [
        { label: 'Agenda', href: '/agenda', icon: CalendarDays },
        { label: 'Pacientes', href: '/pacientes', icon: Users },
        { label: 'Notas', href: '/notas', icon: ClipboardList },
        { label: 'Presupuestos', href: '/presupuestos', icon: ReceiptText },
    ],
    receptionist: [
        { label: 'Agenda', href: '/agenda', icon: CalendarDays },
        { label: 'Pacientes', href: '/pacientes', icon: Users },
        { label: 'Cubículos', href: '/ajustes/cubiculos', icon: Building2 },
        { label: 'Presupuestos', href: '/presupuestos', icon: ReceiptText },
        {
            label: 'Tratamientos',
            href: '/ajustes/tratamientos',
            icon: FileText,
        },
        { label: 'Facturación', href: '/ajustes/facturacion', icon: Receipt },
        { label: 'Inventario', href: '/ajustes/inventario', icon: Archive },
    ],
    patient: [
        { label: 'Inicio', href: '/portal/inicio', icon: LayoutDashboard },
        { label: 'Mis Citas', href: '/portal/citas', icon: CalendarDays },
        { label: 'Mi Expediente', href: '/portal/expediente', icon: FileText },
        {
            label: 'Mis Presupuestos',
            href: '/portal/presupuestos',
            icon: Banknote,
        },
    ],
}

export function getNavItems(role: UserRole): NavItem[] {
    return NAV_ITEMS[role] ?? []
}
