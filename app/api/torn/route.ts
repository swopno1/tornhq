import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { callTornApi } from "@/lib/torn-api";
import {
  getCached,
  setCached,
  tornCacheKey,
  tornRatelimit,
} from "@/lib/cache";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const section = searchParams.get("section") ?? "user";
  const selections = searchParams.get("selections") ?? "basic";
  const id = searchParams.get("id") ?? "";

  const { userId, tornId } = session.user;

  // Per-user sliding window rate limit
  const { success, remaining } = await tornRatelimit.limit(userId);
  if (!success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again shortly." },
      {
        status: 429,
        headers: { "X-RateLimit-Remaining": "0" },
      },
    );
  }

  // Return cached response if available
  const cacheKey = tornCacheKey(tornId, section, id, selections);
  const cached = await getCached(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        "X-Cache": "HIT",
        "X-RateLimit-Remaining": String(remaining),
      },
    });
  }

  // Decrypt stored API key and proxy the request
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const apiKey = decrypt(user.apiKeyEnc);
  const path = id
    ? `/${section}/${id}?selections=${selections}`
    : `/${section}?selections=${selections}`;

  const data = await callTornApi(path, apiKey);

  if (data.error) {
    return NextResponse.json(data, { status: 400 });
  }

  await setCached(cacheKey, data);

  return NextResponse.json(data, {
    headers: {
      "X-Cache": "MISS",
      "X-RateLimit-Remaining": String(remaining),
    },
  });
}
