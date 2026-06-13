import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { fetchSlotsBalance } from "@/lib/torn-api";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!session.user.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.userId },
    select: { apiKeyEnc: true },
  });

  if (!user?.apiKeyEnc) {
    return NextResponse.json({ error: "No Torn API key configured." }, { status: 400 });
  }

  const apiKey = decrypt(user.apiKeyEnc);
  const balance = await fetchSlotsBalance(apiKey);

  if (balance === null) {
    return NextResponse.json(
      { error: "Could not fetch token balance — ensure your API key has Limited access or higher." },
      { status: 400 },
    );
  }

  return NextResponse.json({ balance });
}
