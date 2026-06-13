import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import type { TornUserMoney, TornApiError } from "@/lib/torn-api";

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

  try {
    const res = await fetch(
      `https://api.torn.com/user?selections=money&key=${apiKey}`,
      { cache: "no-store" },
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `Torn API HTTP error: ${res.status}` },
        { status: 400 },
      );
    }

    const data: (TornUserMoney & Partial<TornApiError>) = await res.json();

    if (data.error) {
      return NextResponse.json(
        { error: `Torn API error [${data.error.code}]: ${data.error.error}` },
        { status: 400 },
      );
    }

    // Torn omits points_balance (or returns null) when the user has never held casino tokens.
    // Treat both as 0 — a missing field is not an error.
    const balance = typeof data.points_balance === "number" ? data.points_balance : 0;

    return NextResponse.json({ balance });
  } catch (err) {
    return NextResponse.json(
      { error: `Network error: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 },
    );
  }
}
