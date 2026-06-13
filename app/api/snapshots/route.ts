import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { callTornApi } from "@/lib/torn-api";
import type { TornBattleStats } from "@/lib/torn-api";

/** GET /api/snapshots?limit=30  — returns the user's stat snapshots, newest first */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = Math.min(
    100,
    parseInt(req.nextUrl.searchParams.get("limit") ?? "30", 10),
  );

  const snapshots = await prisma.statSnapshot.findMany({
    where: { userId: session.user.userId },
    orderBy: { takenAt: "desc" },
    take: limit,
  });

  return NextResponse.json(snapshots);
}

/** POST /api/snapshots  — fetches battle stats from Torn and stores a new snapshot */
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = session.user;

  // Skip if a snapshot was taken in the last hour
  const recent = await prisma.statSnapshot.findFirst({
    where: {
      userId,
      takenAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
    },
  });
  if (recent) {
    return NextResponse.json({ skipped: true, reason: "Recent snapshot exists" });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const apiKey = decrypt(user.apiKeyEnc);
  const data = await callTornApi<TornBattleStats>(
    "/user?selections=battlestats,profile",
    apiKey,
  );

  if (data.error) {
    return NextResponse.json(
      { error: data.error.error ?? "Torn API error", code: data.error.code },
      { status: 400 },
    );
  }

  const snapshot = await prisma.statSnapshot.create({
    data: {
      userId,
      strength: data.strength ?? 0,
      defense: data.defense ?? 0,
      speed: data.speed ?? 0,
      dexterity: data.dexterity ?? 0,
      total: data.total ?? 0,
      level: data.level ?? 0,
      xp: data.xp ?? 0,
    },
  });

  return NextResponse.json(snapshot, { status: 201 });
}
