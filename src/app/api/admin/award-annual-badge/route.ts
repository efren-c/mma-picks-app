import { awardAnnualBadge } from "@/lib/annual-badges";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const session = await auth();

    // Basic admin check (assumes role 'ADMIN' exists on user)
    if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year");
    const forceParam = searchParams.get("force");

    if (!yearParam) {
        return NextResponse.json({ error: "Year is required" }, { status: 400 });
    }

    const year = parseInt(yearParam);
    const force = forceParam === 'true';

    try {
        const result = await awardAnnualBadge(year, force);
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
