import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import type {
  TornV2EquipmentResponse,
  TornV2AmmoResponse,
  TornV2BazaarResponse,
  TornApiError,
} from "@/lib/torn-api";

// v2 always uses the canonical Torn host — never TORN_API_BASE (which is v1-scoped)
const V2_BASE = "https://api.torn.com/v2/user";

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
    const [equipRes, ammoRes, bazaarRes] = await Promise.all([
      fetch(`${V2_BASE}/equipment?key=${apiKey}`, { cache: "no-store" }),
      fetch(`${V2_BASE}/ammo?key=${apiKey}`, { cache: "no-store" }),
      fetch(`${V2_BASE}/bazaar?key=${apiKey}`, { cache: "no-store" }),
    ]);

    const [equipData, ammoData, bazaarData] = (await Promise.all([
      equipRes.json(),
      ammoRes.json(),
      bazaarRes.json(),
    ])) as [
      TornV2EquipmentResponse & Partial<TornApiError>,
      TornV2AmmoResponse & Partial<TornApiError>,
      TornV2BazaarResponse & Partial<TornApiError>,
    ];

    if (equipData.error) {
      return NextResponse.json(
        { error: `Torn API error [${equipData.error.code}]: ${equipData.error.error}` },
        { status: 400 },
      );
    }

    return NextResponse.json({
      equipment: equipData.equipment ?? [],
      clothing: equipData.clothing ?? [],
      ammo: ammoData.error ? [] : (ammoData.ammo ?? []),
      bazaar: bazaarData.error ? [] : (bazaarData.bazaar ?? []),
      bazaarOpen: bazaarData.error ? null : (bazaarData.bazaar_is_open ?? false),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Network error" },
      { status: 500 },
    );
  }
}
