import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { callTornApi } from "@/lib/torn-api";
import type { TornItemsResponse } from "@/lib/torn-api";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await prisma.watchedItem.findMany({
    where: { userId: session.user.userId },
    include: {
      item: {
        include: {
          priceHistory: {
            orderBy: { recordedAt: "desc" },
            take: 24,
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const tornItemId = Number(body?.tornItemId);
  if (!tornItemId || isNaN(tornItemId) || tornItemId <= 0) {
    return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.userId },
    select: { apiKeyEnc: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (!user.apiKeyEnc) {
    return NextResponse.json(
      { error: "No Torn API key configured." },
      { status: 400 },
    );
  }

  const apiKey = decrypt(user.apiKeyEnc);
  const data = await callTornApi<TornItemsResponse>(
    `/torn/${tornItemId}?selections=items`,
    apiKey,
  );

  const tornItem = data.items?.[String(tornItemId)];
  if (data.error || !tornItem) {
    return NextResponse.json({ error: "Item not found on Torn" }, { status: 404 });
  }

  const marketItem = await prisma.marketItem.upsert({
    where: { tornItemId },
    update: { name: tornItem.name, category: tornItem.type },
    create: { tornItemId, name: tornItem.name, category: tornItem.type },
  });

  const existing = await prisma.watchedItem.findUnique({
    where: { userId_itemId: { userId: session.user.userId, itemId: marketItem.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "Already watching this item" }, { status: 409 });
  }

  const alertBelow = body?.alertBelow != null ? Number(body.alertBelow) : null;
  const alertAbove = body?.alertAbove != null ? Number(body.alertAbove) : null;

  const watchedItem = await prisma.watchedItem.create({
    data: {
      userId: session.user.userId,
      itemId: marketItem.id,
      alertBelow,
      alertAbove,
    },
    include: { item: true },
  });

  return NextResponse.json({ watchedItem }, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId");
  if (!itemId) return NextResponse.json({ error: "Missing itemId" }, { status: 400 });

  await prisma.watchedItem.delete({
    where: { userId_itemId: { userId: session.user.userId, itemId } },
  });

  return new NextResponse(null, { status: 204 });
}
