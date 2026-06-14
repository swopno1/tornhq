import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { callTornApi } from "@/lib/torn-api";
import type { TornInventoryResponse } from "@/lib/torn-api";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.userId },
    select: { apiKeyEnc: true },
  });

  if (!user?.apiKeyEnc) {
    return NextResponse.json({ error: "No API key configured." }, { status: 400 });
  }

  const apiKey = decrypt(user.apiKeyEnc);

  try {
    const data = await callTornApi<TornInventoryResponse>(
      "/user?selections=inventory",
      apiKey,
    );

    if (data.error) {
      return NextResponse.json(
        { error: `Torn API error [${data.error.code}]: ${data.error.error}` },
        { status: 400 },
      );
    }

    const raw = data.inventory;
    const values: unknown[] = Array.isArray(raw)
      ? raw
      : raw != null
        ? Object.values(raw as object)
        : [];

    const items = values.filter(
      (v): v is NonNullable<typeof v> =>
        v != null && typeof (v as Record<string, unknown>).name === "string",
    );

    return NextResponse.json({ items });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Network error" },
      { status: 500 },
    );
  }
}
