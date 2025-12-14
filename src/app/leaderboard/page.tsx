import { getGlobalLeaderboard, getEventLeaderboard, getYearlyLeaderboard } from '@/app/lib/gamification-actions';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import { EventSelector } from '@/components/EventSelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n";

export default async function LeaderboardPage(props: { searchParams: Promise<{ eventId?: string; year?: string }> }) {
    const searchParams = await props.searchParams;
    const dict = await getDictionary();
    const events = await prisma.event.findMany({
        select: { id: true, name: true, date: true },
        orderBy: { date: 'desc' }
    });

    let targetEventId = searchParams?.eventId;
    let targetYear = searchParams?.year ? parseInt(searchParams.year) : new Date().getFullYear();
    const isAllTime = searchParams?.year === 'all-time';

    const years = Array.from(new Set(events.map(e => new Date(e.date).getFullYear()))).sort((a, b) => b - a);

    // Filter events for the selected year
    const filteredEvents = isAllTime
        ? events
        : events.filter(e => new Date(e.date).getFullYear() === targetYear);

    // Smart default: If no specific event request, check for "active" event within the selected year
    if (!targetEventId && !isAllTime) {
        const now = new Date();
        const recentLimit = new Date(now.getTime() - 8 * 60 * 60 * 1000);

        // Find the most recent event that has started AND is in the selected year
        const activeEvent = filteredEvents.find(e => e.date < now && e.date > recentLimit);

        if (activeEvent) {
            targetEventId = activeEvent.id;
        }
    }

    let leaderboard;
    let title: string = isAllTime ? dict.leaderboard.globalTitle : `${targetYear} ${dict.leaderboard.titleSuffix}`;
    let description: string = isAllTime ? dict.leaderboard.globalDescription : `${dict.leaderboard.eventDescription} ${targetYear}`;

    // Handle leaderboard data fetching
    if (targetEventId && targetEventId !== 'global' && targetEventId !== 'season') {
        leaderboard = await getEventLeaderboard(targetEventId);
        const event = events.find(e => e.id === targetEventId);
        if (event) {
            title = `${dict.leaderboard.titleSuffix}`;
            description = `${dict.leaderboard.eventDescription} ${event.name}`;
        }
    } else if (isAllTime) {
        leaderboard = await getGlobalLeaderboard();
        title = dict.leaderboard.globalTitle;
        description = dict.leaderboard.globalDescription;
    } else {
        // Yearly leaderboard (Season)
        leaderboard = await getYearlyLeaderboard(targetYear);
        // Ensure title reflects "Season"
        title = `${targetYear} Season Leaderboard`;
    }

    const session = await auth();
    let currentUserId: string | undefined;

    if (session?.user?.email) {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });
        currentUserId = user?.id;
    }

    return (
        <div className="container mx-auto py-8 max-w-4xl space-y-6">
            <div className="flex justify-end">
                <EventSelector
                    events={filteredEvents}
                    years={years}
                    selectedEventId={targetEventId}
                    selectedYear={isAllTime ? 'all-time' : targetYear.toString()}
                    dict={dict}
                />
            </div>

            <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-2xl font-bold text-white">{title}</CardTitle>
                            <CardDescription className="text-slate-400">{description}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <LeaderboardTable users={leaderboard} currentUserId={currentUserId} dict={dict} />
                </CardContent>
            </Card>
        </div>
    );
}
