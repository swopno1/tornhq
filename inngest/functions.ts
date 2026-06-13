import { inngest } from "./client";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { callTornApi } from "@/lib/torn-api";
import type { TornBattleStats } from "@/lib/torn-api";

export const takeStatSnapshot = inngest.createFunction(
  {
    id: "take-stat-snapshot",
    name: "Take Stat Snapshot (all users)",
    triggers: [{ cron: "0 */6 * * *" }],
  },
  async ({ step }) => {
    const users = await step.run("fetch-users", () =>
      prisma.user.findMany({ select: { id: true, apiKeyEnc: true } }),
    );

    const results = await Promise.allSettled(
      users.map((user: { id: string; apiKeyEnc: string }) =>
        step.run(`snapshot-${user.id}`, async () => {
          const apiKey = decrypt(user.apiKeyEnc);
          const data = await callTornApi<TornBattleStats>(
            "/user?selections=battlestats,profile",
            apiKey,
          );

          if (data.error) return { skipped: true, userId: user.id };

          await prisma.statSnapshot.create({
            data: {
              userId: user.id,
              strength: data.strength ?? 0,
              defense: data.defense ?? 0,
              speed: data.speed ?? 0,
              dexterity: data.dexterity ?? 0,
              total: data.total ?? 0,
              level: data.level ?? 0,
              xp: data.xp ?? 0,
            },
          });
          return { ok: true, userId: user.id };
        }),
      ),
    );

    return { processed: users.length, results: results.length };
  },
);
