import { NextResponse } from "next/server";
import { getTime } from "./get-time";
import { formatISO } from "date-fns";

export async function GET() {
    const utcDate = getTime();
    return NextResponse.json({
        serverTime: utcDate,
    });
}