import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/crypto";
import { validateApiKey } from "@/lib/torn-api";

const schema = z.object({ apiKey: z.string().min(1) });

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { apiKey } = parsed.data;

  const player = await validateApiKey(apiKey);
  if (!player) {
    return NextResponse.json(
      { error: "Invalid Torn API key. Check the key and try again." },
      { status: 400 },
    );
  }

  const apiKeyEnc = encrypt(apiKey);
  await prisma.user.update({
    where: { id: session.user.userId },
    data: { apiKeyEnc, tornId: player.playerId },
  });

  return NextResponse.json({ tornId: player.playerId, name: player.name });
}
