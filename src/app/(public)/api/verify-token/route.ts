import { verifyIdToken } from "@/lib/firebase/firebase-admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { token } = await req.json();
    const decodedToken = await verifyIdToken(token);
    return NextResponse.json({ decodedToken });
}