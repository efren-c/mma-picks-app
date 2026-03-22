import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <main className="min-h-screen bg-slate-950 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <header className="flex flex-col space-y-4">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-6 w-96" />
                </header>

                <section>
                    <div className="flex items-center mb-6">
                        <Skeleton className="w-1 h-8 mr-3 rounded-full" />
                        <Skeleton className="h-8 w-48" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-full flex flex-col rounded-xl border border-slate-800 bg-card text-card-foreground shadow overflow-hidden">
                                <Skeleton className="h-48 w-full rounded-none" />
                                <div className="p-6 space-y-4">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    )
}
