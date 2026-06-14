import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { callTornApi } from "@/lib/torn-api";
import type { TornItemsResponse } from "@/lib/torn-api";
import { getCached, setCached } from "@/lib/cache";

const CATALOG_CACHE_KEY = "torn:items:catalog";
const CATALOG_TTL = 86400; // 24h — item catalog almost never changes

type SlimItem = { name: string; type: string };

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim().toLowerCase() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  let catalog = await getCached<Record<string, SlimItem>>(CATALOG_CACHE_KEY);

  if (!catalog) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.userId },
      select: { apiKeyEnc: true },
    });
    if (!user?.apiKeyEnc) {
      return NextResponse.json({ error: "No API key configured." }, { status: 400 });
    }
    const apiKey = decrypt(user.apiKeyEnc);

    const data = await callTornApi<TornItemsResponse>("/torn/?selections=items", apiKey);
    if (data.error || !data.items) {
      return NextResponse.json({ error: "Failed to load item catalog" }, { status: 500 });
    }

    catalog = {};
    for (const [id, item] of Object.entries(data.items)) {
      catalog[id] = { name: item.name, type: item.type };
    }
    await setCached(CATALOG_CACHE_KEY, catalog, CATALOG_TTL);
  }

  const results = Object.entries(catalog)
    .filter(([, item]) => item.name.toLowerCase().includes(q))
    .map(([id, item]) => ({ id: Number(id), name: item.name, type: item.type }))
    .sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(q);
      const bStarts = b.name.toLowerCase().startsWith(q);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 8);

  return NextResponse.json({ results });
}
