import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import type { TornInventoryV2Response, TornInventoryItemV2, TornInventoryItem } from "@/lib/torn-api";

// v2 always uses the canonical Torn host — never TORN_API_BASE (which is v1-scoped)
const V2_ITEMS_URL = "https://api.torn.com/v2/user/items";

function normalise(v2: TornInventoryItemV2): TornInventoryItem {
  return {
    ID: v2.id,
    uid: v2.uid,
    name: v2.name,
    // Prefer sub_type for display (e.g. "SMG" over "Weapon"); fall back to type
    type: v2.sub_type ?? v2.type,
    quantity: v2.quantity ?? 1,
    market_price: v2.market_price ?? 0,
    equipped: v2.equipped ? 1 : 0,
  };
}

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
    const res = await fetch(`${V2_ITEMS_URL}?key=${apiKey}`, { cache: "no-store" });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Torn API responded with HTTP ${res.status}` },
        { status: 500 },
      );
    }

    const data: TornInventoryV2Response & { error?: { code: number; error: string } } =
      await res.json();

    if (data.error) {
      if (data.error.code === 16) {
        // v2 /user/items requires a Custom key with the 'items' permission explicitly enabled.
        // Standard Full Access (level 4) keys do NOT include this permission automatically.
        return NextResponse.json(
          {
            error:
              "Your API key is missing the 'items' permission required by Torn API v2. " +
              "Create a Custom key at Torn (Preferences → API) with the User > Items permission enabled.",
            errorCode: "KEY_NEEDS_UPDATE",
          },
          { status: 403 },
        );
      }
      return NextResponse.json(
        { error: `Torn API error [${data.error.code}]: ${data.error.error}` },
        { status: 400 },
      );
    }

    const raw = data.items;
    const values: TornInventoryItemV2[] = Array.isArray(raw)
      ? raw
      : raw != null
        ? (Object.values(raw) as TornInventoryItemV2[])
        : [];

    const items: TornInventoryItem[] = values
      .filter((v) => v != null && typeof v.name === "string")
      .map(normalise);

    return NextResponse.json({ items });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Network error" },
      { status: 500 },
    );
  }
}
