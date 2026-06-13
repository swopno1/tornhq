import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const unreadOnly = searchParams.get("unreadOnly") === "true";
  const limit = Math.min(Number(searchParams.get("limit") ?? "50"), 100);

  const alerts = await prisma.alert.findMany({
    where: {
      userId: session.user.userId,
      ...(unreadOnly ? { readAt: null } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ alerts });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const ids: string[] = Array.isArray(body?.ids) ? body.ids : [];
  const markAll: boolean = body?.markAll === true;
  const now = new Date();

  if (markAll) {
    await prisma.alert.updateMany({
      where: { userId: session.user.userId, readAt: null },
      data: { readAt: now },
    });
  } else if (ids.length > 0) {
    await prisma.alert.updateMany({
      where: { userId: session.user.userId, id: { in: ids }, readAt: null },
      data: { readAt: now },
    });
  }

  return NextResponse.json({ ok: true });
}
