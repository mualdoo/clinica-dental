import { MobileNavbar, DesktopSidebar } from '@/components/layout/Sidebar'

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            {/* Solo visible en mobile */}
            <MobileNavbar />

            <div className="flex min-h-screen bg-background">
                {/* Solo visible en desktop */}
                <DesktopSidebar />

                <main className="flex-1 min-w-0 p-4 lg:p-6">{children}</main>
            </div>
        </>
    )
}
