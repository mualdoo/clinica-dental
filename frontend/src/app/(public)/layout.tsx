export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <main className="min-h-screen flex items-center justify-center from-sky-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
            <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                aria-hidden
            >
                <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-cyan-400/5 blur-3xl" />
            </div>
            <div className="relative z-10 w-full flex justify-center">
                {children}
            </div>
        </main>
    )
}
