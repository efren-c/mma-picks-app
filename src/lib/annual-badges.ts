import { prisma } from '@/lib/prisma';

export async function awardAnnualBadge(year: number, force: boolean = false) {
    const nextYear = year + 1;
    const now = new Date();
    const endOfYear = new Date(`${nextYear}-01-01T00:00:00.000Z`);

    if (now < endOfYear && !force) {
        throw new Error(`Cannot award badge for ${year} yet. Wait until ${endOfYear.toISOString()} or use force=true.`);
    }

    console.log(`Starting annual badge award for ${year}...`);

    // 1. Find all events in the target year
    const startOfYearDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endOfYearDate = new Date(`${nextYear}-01-01T00:00:00.000Z`);

    const events = await prisma.event.findMany({
        where: {
            date: {
                gte: startOfYearDate,
                lt: endOfYearDate,
            },
        },
        select: { id: true },
    });

    if (events.length === 0) {
        console.log(`No events found for ${year}.`);
        return { success: false, message: `No events found for ${year}` };
    }

    const eventIds = events.map(e => e.id);
    console.log(`Found ${events.length} events for ${year}.`);

    // 2. Aggregate scores for these events
    // We need to sum up points from all Picks belonging to these events
    // Prisma doesn't have a direct "sum by group" for this deep relation easily in one go without raw query or grouping on flattened table.
    // 'Pick' has 'fightId', 'Fight' has 'eventId'.

    // Let's get all picks for these events that have points
    const picks = await prisma.pick.findMany({
        where: {
            fight: {
                eventId: {
                    in: eventIds,
                },
            },
            points: {
                not: null,
            },
        },
        select: {
            userId: true,
            points: true,
        },
    });

    if (picks.length === 0) {
        console.log(`No scored picks found for ${year}.`);
        return { success: false, message: `No scored picks found for ${year}` };
    }

    // Calculate total points per user
    const userScores = new Map<string, number>();

    for (const pick of picks) {
        const current = userScores.get(pick.userId) || 0;
        userScores.set(pick.userId, current + (pick.points || 0));
    }

    // Find max score
    let maxScore = -1;
    for (const score of userScores.values()) {
        if (score > maxScore) maxScore = score;
    }

    if (maxScore <= 0) {
        console.log(`Max score is ${maxScore}, no one to award.`);
        return { success: false, message: "No valid scores found." };
    }

    // Identify winners (could be ties)
    const winners: string[] = [];
    for (const [userId, score] of userScores.entries()) {
        if (score === maxScore) {
            winners.push(userId);
        }
    }

    console.log(`Top score: ${maxScore} by users: ${JSON.stringify(winners)}`);

    // 3. Create or Get Badge
    const badgeName = `Best of ${year}`;
    const badgeDescription = `Top scorer with ${maxScore} points`;
    const badgeIcon = 'Trophy';

    let badge = await prisma.badge.findUnique({
        where: { name: badgeName },
    });

    if (!badge) {
        console.log(`Creating badge: ${badgeName}`);
        badge = await prisma.badge.create({
            data: {
                name: badgeName,
                description: badgeDescription,
                icon: badgeIcon,
            },
        });
    } else {
        // Update description if needed (e.g. to update the winning score if re-running)
        await prisma.badge.update({
            where: { id: badge.id },
            data: { description: badgeDescription }
        });
    }

    // 4. Assign Badge to Winners
    const results = [];
    for (const userId of winners) {
        try {
            // Check if already assigned
            const existing = await prisma.userBadge.findUnique({
                where: {
                    userId_badgeId: {
                        userId,
                        badgeId: badge.id
                    }
                }
            });

            if (!existing) {
                await prisma.userBadge.create({
                    data: {
                        userId,
                        badgeId: badge.id,
                    },
                });
                results.push(`Awarded to user ${userId}`);
            } else {
                results.push(`User ${userId} already has badge`);
            }
        } catch (error) {
            console.error(`Failed to award badge to ${userId}`, error);
        }
    }

    return {
        success: true,
        year,
        maxScore,
        winners,
        badge: badgeName,
        actions: results
    };
}
