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
} from 'lucide-react'
import type { UserRole } from '@/types/auth'

export interface NavItem {
    label: string
    href: string
    icon: LucideIcon
}

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
    admin: [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Agenda', href: '/agenda', icon: CalendarDays },
        { label: 'Pacientes', href: '/pacientes', icon: Users },
        { label: 'Dentistas', href: '/ajustes/dentistas', icon: UserCog },
        { label: 'Cubículos', href: '/ajustes/cubiculos', icon: Building2 },
        {
            label: 'Tratamientos',
            href: '/ajustes/tratamientos',
            icon: FileText,
        },
    ],
    dentist: [
        { label: 'Agenda', href: '/agenda', icon: CalendarDays },
        { label: 'Pacientes', href: '/pacientes', icon: Users },
        { label: 'Notas', href: '/notas', icon: ClipboardList },
    ],
    receptionist: [
        { label: 'Agenda', href: '/agenda', icon: CalendarDays },
        { label: 'Pacientes', href: '/pacientes', icon: Users },
        { label: 'Cubículos', href: '/cubiculos', icon: Building2 },
    ],
    patient: [
        { label: 'Mi Portal', href: '/portal', icon: LayoutDashboard },
        { label: 'Mis Citas', href: '/portal/citas', icon: CalendarDays },
        { label: 'Mi Expediente', href: '/portal/expediente', icon: FileText },
    ],
}

export function getNavItems(role: UserRole): NavItem[] {
    return NAV_ITEMS[role] ?? []
}
