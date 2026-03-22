import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <main className="min-h-screen bg-slate-950 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Event Header */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 h-64">
                    <Skeleton className="w-full h-full" />
                </div>

                {/* Fight Card */}
                <div className="space-y-4">
                    <div className="flex items-center mb-4">
                        <Skeleton className="w-1 h-8 mr-3 rounded-full" />
                        <Skeleton className="h-8 w-32" />
                    </div>

                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-32 w-full rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        </main>
    )
}
