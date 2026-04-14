import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Find UNSEEN event results 
        const unseenResults = await prisma.userEventResult.findMany({
            where: {
                userId: user.id,
                seen: false
            },
            include: {
                event: {
                    select: {
                        name: true,
                        id: true
                    }
                }
            },
            // Order by most recent event if there are multiple
            orderBy: {
                createdAt: 'desc' // We added createdAt to schema
            }
        });

        return NextResponse.json({ results: unseenResults });
    } catch (error) {
        console.error("Error fetching event results:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { resultId } = body;

        if (!resultId) {
            return NextResponse.json({ error: 'Missing resultId' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Update seen status
        await prisma.userEventResult.updateMany({
            where: {
                id: resultId,
                userId: user.id // Security check
            },
            data: {
                seen: true
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating event result:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
